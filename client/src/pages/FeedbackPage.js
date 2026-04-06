import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { theme } from '../styles/theme';
import { sessionAPI } from '../utils/api';
import PencilIcon from '../components/common/PencilIcon';

function FeedbackPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  const submitFeedback = async () => {
    if (!score) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await sessionAPI.submitFeedbackByToken(token, { score, comment });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.gray50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        padding: '40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              background: `${theme.colors.success}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PencilIcon name="check" size={32} color={theme.colors.success} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, marginBottom: '12px' }}>
              Thank You!
            </h2>
            <p style={{ fontSize: '15px', color: theme.colors.gray600, lineHeight: 1.5 }}>
              Your feedback helps us maintain a supportive and high-quality environment for everyone.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                background: `${theme.colors.primary}10`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PencilIcon name="star" size={32} color={theme.colors.primary} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.primary, margin: '0 0 8px' }}>
                Rate Your Session
              </h2>
              <p style={{ fontSize: '15px', color: theme.colors.gray600 }}>
                How was your peer support session today? Your feedback is valuable.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '42px',
                    lineHeight: 1,
                    transition: 'transform 0.1s',
                    transform: (hover || score) >= i ? 'scale(1.15)' : 'scale(1)',
                    color: (hover || score) >= i ? '#fbbf24' : theme.colors.gray300
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 600,
              color: theme.colors.primary,
              marginBottom: '24px',
              height: '22px'
            }}>
              {labels[hover || score] || ''}
            </div>

            <textarea
              rows={4}
              placeholder="Share your experience or suggestions (optional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '24px',
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={submitFeedback}
              disabled={loading || !score}
              style={{
                width: '100%',
                padding: '16px',
                background: loading || !score ? theme.colors.gray300 : theme.colors.primary,
                color: theme.colors.white,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading || !score ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;
