const { sendSuccess, sendError } = require('../utils/responseHelper');
const DsaProgress = require('../models/DsaProgress');

// GET /api/student/dsa/progress
const getDsaProgress = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const doc = await DsaProgress.findOne({ studentId }).lean();
    if (!doc) {
      return sendSuccess(res, 200, 'DSA progress fetched.', { solvedKeys: [], revisionKeys: [] });
    }

    return sendSuccess(res, 200, 'DSA progress fetched.', {
      solvedKeys: doc.solvedKeys || [],
      revisionKeys: doc.revisionKeys || [],
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// PATCH /api/student/dsa/items
// Body: { itemKey: string, solved?: boolean, revision?: boolean }
const patchDsaItem = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { itemKey, solved, revision } = req.body || {};
    if (!itemKey) return sendError(res, 400, 'itemKey is required.');

    const addToSet = {};
    const pull = {};

    if (typeof solved === 'boolean') {
      if (solved) addToSet.solvedKeys = itemKey;
      else pull.solvedKeys = itemKey;
    }

    if (typeof revision === 'boolean') {
      if (revision) addToSet.revisionKeys = itemKey;
      else pull.revisionKeys = itemKey;
    }

    const update = { $setOnInsert: { studentId } };
    if (Object.keys(addToSet).length) update.$addToSet = addToSet;
    if (Object.keys(pull).length) update.$pull = pull;

    const doc = await DsaProgress.findOneAndUpdate({ studentId }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).lean();

    return sendSuccess(res, 200, 'DSA progress updated.', {
      solvedKeys: doc?.solvedKeys || [],
      revisionKeys: doc?.revisionKeys || [],
      updatedAt: doc?.updatedAt,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getDsaProgress, patchDsaItem };

