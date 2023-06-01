/**
 * Expand or close the sidebar in mobile screens.
 */

const $body = $('body');
const ATTR_DISPLAY = 'sidebar-display';
const ATTR_DRAGGING = 'sidebar-dragging';
const SIDEBAR_WIDTH = 260;

class SidebarUtil {
  static isExpanded = false;
  static isDragging = false;
  static isLocked = false;

  static toggle() {
    if (SidebarUtil.isExpanded === false) {
      $body.attr(ATTR_DISPLAY, '');
    } else {
      $body.removeAttr(ATTR_DISPLAY);
    }

    SidebarUtil.isExpanded = !SidebarUtil.isExpanded;
  }

  static expand() {
    $body.attr(ATTR_DISPLAY, '');

    SidebarUtil.isExpanded = true;
  }

  static collapse() {
    $body.removeAttr(ATTR_DISPLAY);

    SidebarUtil.isExpanded = false;
  }

  static enableDragging() {
    if (SidebarUtil.isLocked) return;
    $body.attr(ATTR_DRAGGING, '');

    SidebarUtil.isDragging = true;
  }

  static disableDragging() {
    if (SidebarUtil.isLocked) return;
    $body.removeAttr(ATTR_DRAGGING);

    SidebarUtil.isDragging = false;
  }

  static lock() {
    SidebarUtil.isLocked = true;
  }

  static unlock() {
    SidebarUtil.isLocked = false;
  }
}

export function sidebarExpand() {
  $('#sidebar-trigger').on('click', SidebarUtil.toggle);
  $('#mask').on('click', SidebarUtil.toggle);

  let touchStartX = null;
  let touchStartY = null;
  let diffX = null;
  let diffY = null;
  let deltaX = null;
  let isProcessed = false;
  let lastTouchMoveX = null;

  document.documentElement.style.setProperty('--sidebar-offset', '0px');

  $(document).on('touchstart', e => {
    isProcessed = $(e.target).closest('.map').length > 0 || $(e.target).closest('.carousel').length > 0 || $(e.target).closest('.overflow-x-auto').length > 0;
    if (isProcessed) return;

    touchStartX = e.originalEvent.touches[0].clientX;
    touchStartY = e.originalEvent.touches[0].clientY;
    lastTouchMoveX = touchStartX;
    deltaX = null;

    SidebarUtil.unlock();

    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--sidebar-offset', '0px');
    });
  });

  $(document).on('touchmove', e => {
    if (isProcessed) return;

    const touchMoveX = e.originalEvent.touches[0].clientX;
    const touchMoveY = e.originalEvent.touches[0].clientY;

    diffX = touchMoveX - touchStartX;
    diffY = touchMoveY - touchStartY;

    deltaX = touchMoveX - lastTouchMoveX;
    lastTouchMoveX = touchMoveX;

    // Threshold
    if (!SidebarUtil.isLocked && Math.abs(diffX) < 1 && Math.abs(diffY) < 1) {
      touchStartX = touchMoveX;
      touchStartY = touchMoveY;
      diffX = 0;
      diffY = 0;
      return;
    }

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY);
    if (isHorizontalSwipe) {
      SidebarUtil.enableDragging();
      SidebarUtil.lock();
    } else {
      SidebarUtil.lock();
    }

    if (SidebarUtil.isDragging)
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--sidebar-offset', `${diffX}px`);
      });
  });

  $(document).on('touchend', () => {
    if (isProcessed) return;

    if (SidebarUtil.isDragging) {
      const threshold = SIDEBAR_WIDTH / 2;

      if (diffX > threshold || (deltaX !== null && deltaX > 7)) {
        SidebarUtil.expand();
      } else if (diffX < -threshold || (deltaX !== null && deltaX < -7)) {
        SidebarUtil.collapse();
      }
    }

    SidebarUtil.unlock();
    SidebarUtil.disableDragging();

    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--sidebar-offset', '0px');
    });
  });
}
