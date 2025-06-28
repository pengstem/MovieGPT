import React, { useEffect, useState } from 'react';

interface SimpleConfirmDialogProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

const SimpleConfirmDialog: React.FC<SimpleConfirmDialogProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  anchorRef
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, useAnchor: false });
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isVisible) {
      setShouldRender(true);
      // 延迟一帧触发动画，确保DOM已渲染
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      document.addEventListener('keydown', handleKey);
      
      if (anchorRef?.current) {
        const anchor = anchorRef.current;
        const anchorRect = anchor.getBoundingClientRect();
        
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
          // 移动端居中显示
          setPosition({ top: 0, left: 0, useAnchor: false });
        } else {
          // 桌面端在按钮右上角显示
          const dialogHeight = 120; // 估算弹窗高度
          const left = anchorRect.right + 8;
          const top = anchorRect.top - dialogHeight - 8; // 弹窗底部对齐按钮顶部，再向上8px
          
          // 确保不超出屏幕边界
          const maxLeft = window.innerWidth - 290;
          const finalLeft = Math.min(left, maxLeft);
          const finalTop = Math.max(8, top); // 确保不超出屏幕顶部
          
          setPosition({ top: finalTop, left: finalLeft, useAnchor: true });
        }
      } else {
        // 如果没有anchorRef，则居中显示
        setPosition({ top: 0, left: 0, useAnchor: false });
      }
    } else {
      // 退出动画
      setIsAnimating(false);
      // 等待动画完成后移除DOM
      setTimeout(() => {
        setShouldRender(false);
      }, 200);
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isVisible, anchorRef]);

  const handleCancel = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onCancel();
    }, 150);
  };

  if (!shouldRender) {
    return null;
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: position.useAnchor ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
    zIndex: 10000,
    display: position.useAnchor ? 'block' : 'flex',
    alignItems: position.useAnchor ? 'unset' : 'center',
    justifyContent: position.useAnchor ? 'unset' : 'center',
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-color)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    width: '280px',
    maxWidth: 'calc(100vw - 32px)',
    position: position.useAnchor ? 'absolute' : 'relative',
    top: position.useAnchor ? `${position.top}px` : 'auto',
    left: position.useAnchor ? `${position.left}px` : 'auto',
    zIndex: 10001,
    transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(10px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transformOrigin: position.useAnchor ? 'left bottom' : 'center'
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    textAlign: 'center'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-color)',
    marginBottom: '8px'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'var(--secondary-text-color)',
    marginBottom: '20px',
    lineHeight: '1.4'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-bg)',
    color: 'var(--secondary-text-color)',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transform: 'scale(1)',
  };

  const confirmButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'var(--button-bg)',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transform: 'scale(1)',
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    left: '-6px',
    bottom: '16px',
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRight: 'none',
    borderBottom: 'none',
    transform: 'rotate(-45deg)',
    display: position.useAnchor ? 'block' : 'none',
    opacity: isAnimating ? 1 : 0,
    transition: 'opacity 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s'
  };

  return (
    <div style={overlayStyle} onClick={handleCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        {position.useAnchor && <div style={arrowStyle}></div>}
        <div style={contentStyle}>
          <div style={titleStyle}>创建新聊天</div>
          <div style={descriptionStyle}>此操作会删除已有聊天记录</div>
          <div style={buttonContainerStyle}>
            <button
              style={cancelButtonStyle}
              onClick={handleCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              取消
            </button>
            <button
              style={confirmButtonStyle}
              onClick={onConfirm}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--button-bg)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleConfirmDialog; 