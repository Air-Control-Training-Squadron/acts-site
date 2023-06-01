/**
 * Expand or close the sidebar in mobile screens.
 */

const $body = $('body');
const ATTR_DISPLAY = 'sidebar-display';
const ATTR_DRAGGING = 'sidebar-dragging';
const SIDEBAR_WIDTH = 260;

class SidebarUtil {
  static isExpanded = false;

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
    $body.attr(ATTR_DRAGGING, '');
  }

  static disableDragging() {
    $body.removeAttr(ATTR_DRAGGING);
  }
}

export function sidebarExpand() {
  $('#sidebar-trigger').on('click', SidebarUtil.toggle);
  $('#mask').on('click', SidebarUtil.toggle);

  let touchStartX = null;
  let diffX = null;

  document.documentElement.style.setProperty('--sidebar-offset', '0px');

  $(document).on('touchstart', e => {
    touchStartX = e.originalEvent.touches[0].clientX;
    document.documentElement.style.setProperty('--sidebar-offset', '0px');
    SidebarUtil.enableDragging();
  });

  $(document).on('touchmove', e => {
    const touchMoveX = e.originalEvent.touches[0].clientX;
    diffX = touchMoveX - touchStartX;

    document.documentElement.style.setProperty('--sidebar-offset', `${diffX}px`);
  });

  $(document).on('touchend', () => {
    document.documentElement.style.setProperty('--sidebar-offset', '0px');
    SidebarUtil.disableDragging();

    const threshold = SIDEBAR_WIDTH / 2;

    if (diffX > threshold) {
      SidebarUtil.expand();
    } else if (diffX < -threshold) {
      SidebarUtil.collapse();
    }
  });
}
