const cron = require('node-cron');
const Session = require('../models/Session');
const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../utils/constants'); // Provide a fallback if constants is missing, wait let me check if it's there. Just use a string.

const autoCompleteExpiredSessions = async () => {
  try {
    const now = new Date();
    
    // Find sessions that have expired based on currentEndTime and status is live/upcoming
    const expiredSessions = await Session.find({
      status: { $in: ['live', 'upcoming'] },
      $or: [
        { currentEndTime: { $lt: now } },
        // For upcoming sessions that never started and passed their scheduled end time
        { 
          status: 'upcoming', 
          date: { $lt: now },
          $expr: {
            $lt: [
              { $add: [
                { $dateFromString: { dateString: { $concat: [ { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, "T", "$time" ] } } }, 
                { $multiply: ["$duration", 60000] }
              ]}, 
              now
            ]
          }
        }
      ]
    }).populate('user').populate('supporter');

    if (expiredSessions.length === 0) return;

    console.log(`[Auto-Complete Job] Found ${expiredSessions.length} expired session(s)`);

    for (const session of expiredSessions) {
      // If it was already live and expired, or an old upcoming session
      session.status = 'ended';
      await session.save();

      // Notify Supporter
      if (session.supporter && session.supporter.addNotification) {
        await session.supporter.addNotification(
          'session_update', // using string just in case NOTIFICATION_TYPES doesn't export correctly
          `Your session with ${session.user ? session.user.name : 'the user'} has ended. Please mark it as complete to allow user feedback.`,
          session._id
        );
      }
      
      // Notify User
      if (session.user && session.user.addNotification) {
        await session.user.addNotification(
          'session_update',
          `Your session with ${session.supporter ? session.supporter.name : 'the supporter'} has ended. Waiting for supporter to mark as complete.`,
          session._id
        );
      }
    }
    
    console.log(`[Auto-Complete Job] Successfully ended ${expiredSessions.length} session(s)`);

  } catch (error) {
    console.error('[Auto-Complete Job] Error:', error.message);
  }
};

module.exports = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('[Cron] Running autoCompleteExpiredSessions job...');
    autoCompleteExpiredSessions();
  });
  console.log('✅ Auto-complete session job instantiated (Refreshes every 5m)');
};
