const Document = require('../models/Document');
const Case = require('../models/Case');
const { AppError } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/helpers');
const { TIMELINE_EVENTS } = require('../utils/constants');
const { uploadToCloudinary } = require('../config/cloudinary');
const { cleanupTempFile } = require('../middleware/upload');
const { extractText, analyzeDocument } = require('../services/documentService');

// @desc    Upload and analyze a document
// @route   POST /api/documents/analyze
// @access  Private
const uploadAndAnalyze = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a document (PDF, DOCX, or TXT)', 400));
    }

    const { language, caseId } = req.body;
    const userLanguage = language || req.user.language || 'en';

    console.log(`📄 Document uploaded: ${req.file.originalname} by ${req.user.name}`);

    // Step 1: Extract text from document
    console.log('   📝 Extracting text...');
    let extractedText;
    try {
      extractedText = await extractText(req.file.path, req.file.mimetype);
    } catch (extractErr) {
      cleanupTempFile(req.file.path);
      return next(new AppError(`Text extraction failed: ${extractErr.message}`, 400));
    }

    if (!extractedText || extractedText.trim().length < 50) {
      cleanupTempFile(req.file.path);
      return next(new AppError('Document has too little readable text to analyze', 400));
    }

    // Step 2: Upload to Cloudinary
    console.log('   ☁️  Uploading to cloud...');
    const uploaded = await uploadToCloudinary(req.file.path, 'jurisbridge/documents');
    cleanupTempFile(req.file.path);

    // Step 3: AI Analysis
    console.log('   🤖 JurisPilot analyzing document...');
    const { analysis, provider } = await analyzeDocument(extractedText, userLanguage);

    // Step 4: Save to database
    const document = await Document.create({
      userId: req.user.id,
      caseId: caseId || null,
      fileName: req.file.originalname,
      fileUrl: uploaded.url,
      publicId: uploaded.publicId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText: extractedText.substring(0, 10000), // Store first 10k chars
      analysis: {
        summary: analysis.summary || '',
        riskIndicators: analysis.riskIndicators || [],
        clauseBreakdown: analysis.clauseBreakdown || [],
        legalImplications: analysis.legalImplications || '',
        recommendation: analysis.recommendation || '',
      },
      isAnalyzed: true,
      analyzedBy: provider,
      language: userLanguage,
    });

    // If linked to a case, update the case timeline
    if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseDoc.documents.push(document._id);
        caseDoc.timeline.push({
          event: TIMELINE_EVENTS.DOCUMENT_UPLOADED,
          description: `Document "${req.file.originalname}" uploaded and analyzed by JurisPilot`,
          performedBy: req.user.id,
        });
        await caseDoc.save();
      }
    }

    console.log(`   ✅ Document analyzed by ${provider}`);

    res.status(201).json({
      success: true,
      message: '📄 Document uploaded and analyzed by JurisPilot!',
      data: document,
    });
  } catch (error) {
    // Cleanup temp file on error
    if (req.file) cleanupTempFile(req.file.path);
    next(error);
  }
};

// @desc    Upload a document WITHOUT analysis (just store)
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a document', 400));
    }

    const { caseId } = req.body;

    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(req.file.path, 'jurisbridge/documents');
    cleanupTempFile(req.file.path);

    const document = await Document.create({
      userId: req.user.id,
      caseId: caseId || null,
      fileName: req.file.originalname,
      fileUrl: uploaded.url,
      publicId: uploaded.publicId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      isAnalyzed: false,
    });

    // Link to case if provided
    if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseDoc.documents.push(document._id);
        caseDoc.timeline.push({
          event: TIMELINE_EVENTS.DOCUMENT_UPLOADED,
          description: `Document "${req.file.originalname}" uploaded`,
          performedBy: req.user.id,
        });
        await caseDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      message: '📄 Document uploaded successfully!',
      data: document,
    });
  } catch (error) {
    if (req.file) cleanupTempFile(req.file.path);
    next(error);
  }
};

// @desc    Get all user's documents
// @route   GET /api/documents
// @access  Private
const getMyDocuments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { caseId, analyzed } = req.query;

    const filter = { userId: req.user.id };
    if (caseId) filter.caseId = caseId;
    if (analyzed === 'true') filter.isAnalyzed = true;
    if (analyzed === 'false') filter.isAnalyzed = false;

    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-extractedText -__v');

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document with full analysis
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-analyze an existing document
// @route   PUT /api/documents/:id/analyze
// @access  Private
const reAnalyzeDocument = async (req, res, next) => {
  try {
    const { language } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    if (!document.extractedText || document.extractedText.length < 50) {
      return next(new AppError('No extracted text available for re-analysis', 400));
    }

    const userLanguage = language || req.user.language || 'en';

    console.log(`🔄 Re-analyzing document: ${document.fileName}`);
    const { analysis, provider } = await analyzeDocument(document.extractedText, userLanguage);

    document.analysis = {
      summary: analysis.summary || '',
      riskIndicators: analysis.riskIndicators || [],
      clauseBreakdown: analysis.clauseBreakdown || [],
      legalImplications: analysis.legalImplications || '',
      recommendation: analysis.recommendation || '',
    };
    document.isAnalyzed = true;
    document.analyzedBy = provider;
    document.language = userLanguage;

    await document.save();

    res.status(200).json({
      success: true,
      message: '🔄 Document re-analyzed by JurisPilot!',
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    // Remove from case if linked
    if (document.caseId) {
      await Case.findByIdAndUpdate(document.caseId, {
        $pull: { documents: document._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndAnalyze,
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  reAnalyzeDocument,
  deleteDocument,
};