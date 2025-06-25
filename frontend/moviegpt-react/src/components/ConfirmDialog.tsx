import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  anchorRef
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && anchorRef.current) {
      const anchor = anchorRef.current;
      const anchorRect = anchor.getBoundingClientRect();
      
      // 计算弹窗位置 - 在按钮上方显示
      const left = anchorRect.left + (anchorRect.width - 260) / 2; // 260px是弹窗宽度
      const top = anchorRect.top - 140; // 140px是估算的弹窗高度 + 间距
      
      // 确保不超出屏幕边界
      const finalLeft = Math.max(10, Math.min(left, window.innerWidth - 270));
      const finalTop = Math.max(10, top);
      
      setPosition({ top: finalTop, left: finalLeft });
    }
  }, [isVisible, anchorRef]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onCancel]);

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onCancel]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div 
        ref={dialogRef} 
        className={styles.dialog}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className={styles.arrow} />
        <div className={styles.content}>
          <div className={styles.icon}>
            <i className="fas fa-plus"></i>
          </div>
          <div className={styles.message}>
            <div className={styles.title}>创建新聊天</div>
            <div className={styles.description}>此操作会删除已有聊天记录</div>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            取消
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 