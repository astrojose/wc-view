/* @ds-bundle: {"format":4,"namespace":"WcViewDesignSystem_136191","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"Toast","sourcePath":"components/core/Toast.jsx"},{"name":"CodeBlock","sourcePath":"components/doc/CodeBlock.jsx"},{"name":"DocCanvas","sourcePath":"components/doc/DocCanvas.jsx"},{"name":"ShortcutsDialog","sourcePath":"components/doc/ShortcutsDialog.jsx"},{"name":"ThemeToggle","sourcePath":"components/doc/ThemeToggle.jsx"},{"name":"AnnotatedBlock","sourcePath":"components/review/AnnotatedBlock.jsx"},{"name":"AnnotationList","sourcePath":"components/review/AnnotationList.jsx"},{"name":"AnnotationPopover","sourcePath":"components/review/AnnotationPopover.jsx"},{"name":"ConfirmDialog","sourcePath":"components/review/ConfirmDialog.jsx"},{"name":"FloatingComposer","sourcePath":"components/review/FloatingComposer.jsx"},{"name":"StatusRegion","sourcePath":"components/review/StatusRegion.jsx"}],"sourceHashes":{"components/core/Button.jsx":"ab014644a7eb","components/core/Chip.jsx":"5a92222c6bcf","components/core/IconButton.jsx":"141f20237249","components/core/StatusBadge.jsx":"e121b56e4139","components/core/Toast.jsx":"dae2a9dd718a","components/doc/CodeBlock.jsx":"f19d811afc65","components/doc/DocCanvas.jsx":"aaad413d121e","components/doc/ShortcutsDialog.jsx":"827636413b0f","components/doc/ThemeToggle.jsx":"0304e82dc972","components/review/AnnotatedBlock.jsx":"d8c40646d8b6","components/review/AnnotationList.jsx":"12e9ba3533b6","components/review/AnnotationPopover.jsx":"9ce5eecd3d9b","components/review/ConfirmDialog.jsx":"c8b919f9038c","components/review/FloatingComposer.jsx":"dd3b786ea245","components/review/StatusRegion.jsx":"0ff0a6253aee","ui_kits/wc-view-review/CliPanel.jsx":"2038098af7bf","ui_kits/wc-view-review/DocumentBody.jsx":"0a64406d47a8","ui_kits/wc-view-review/ReviewSurface.jsx":"f3290f9b3956"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.WcViewDesignSystem_136191 = window.WcViewDesignSystem_136191 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  font: 'var(--type-ui)',
  letterSpacing: 'var(--tracking-tight)',
  borderRadius: 'var(--radius)',
  border: 'var(--border-width) solid transparent',
  cursor: 'pointer',
  transition: 'var(--transition-control)',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};
const sizes = {
  sm: {
    minHeight: '2rem',
    padding: '0 var(--space-3)'
  },
  md: {
    minHeight: 'var(--tap-min)',
    padding: '0 var(--pad-control-x)'
  }
};
const variants = {
  primary: {
    background: 'var(--accent-action)',
    color: 'var(--accent-action-fg)'
  },
  secondary: {
    background: 'var(--surface-raised)',
    color: 'var(--fg-primary)',
    borderColor: 'var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--fg-secondary)'
  },
  danger: {
    background: 'transparent',
    color: 'var(--status-unresolved)',
    borderColor: 'var(--status-unresolved)'
  }
};
function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  icon,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...sizes[size],
      ...variants[variant],
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  children,
  icon,
  count,
  onRemove,
  tone = 'neutral',
  style,
  ...rest
}) {
  const accent = tone === 'accent';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-meta)',
      letterSpacing: 'var(--tracking-tight)',
      color: accent ? 'var(--fg-primary)' : 'var(--fg-secondary)',
      background: accent ? 'var(--annotation-tint-strong)' : 'var(--surface-inset)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderRadius: 'var(--radius-pill)',
      padding: 'var(--space-1) var(--space-3)',
      ...style
    }
  }, rest), icon, /*#__PURE__*/React.createElement("span", null, children), typeof count === 'number' && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-code)',
      color: 'var(--ring-accent)'
    }
  }, count), onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": 'Remove ' + (typeof children === 'string' ? children : 'chip'),
    onClick: onRemove,
    style: {
      background: 'none',
      border: 0,
      color: 'var(--fg-muted)',
      cursor: 'pointer',
      font: 'var(--type-code)',
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  label,
  icon,
  active = false,
  size = 'md',
  style,
  ...rest
}) {
  const dim = size === 'sm' ? '2rem' : 'var(--tap-min)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    "aria-pressed": active || undefined,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: '0 0 auto',
      background: active ? 'var(--annotation-tint-strong)' : 'transparent',
      color: active ? 'var(--fg-primary)' : 'var(--fg-muted)',
      border: 'var(--border-width) solid ' + (active ? 'var(--border-strong)' : 'transparent'),
      borderRadius: 'var(--radius)',
      cursor: 'pointer',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tokens = {
  unresolved: {
    label: 'unresolved',
    color: 'var(--status-unresolved)'
  },
  in_progress: {
    label: 'in progress',
    color: 'var(--status-in-progress)'
  },
  resolved: {
    label: 'resolved',
    color: 'var(--status-resolved)'
  },
  orphaned: {
    label: 'orphaned',
    color: 'var(--status-orphaned)'
  }
};
function StatusBadge({
  status,
  children,
  style,
  ...rest
}) {
  const t = tokens[status] || tokens.unresolved;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-code)',
      fontSize: 'var(--text-xs)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: t.color,
      border: 'var(--border-width) solid currentColor',
      borderRadius: 'var(--radius-sm)',
      padding: '0 var(--space-2)',
      background: 'transparent',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: '0.375rem',
      height: '0.375rem',
      borderRadius: 'var(--radius-pill)',
      background: 'currentColor',
      ...(status === 'orphaned' ? {
        background: 'transparent',
        border: '1px solid currentColor'
      } : null)
    }
  }), children || t.label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toast({
  message,
  meta,
  expanded = false,
  onToggle,
  actions,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    "aria-live": "polite",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      maxWidth: '46rem',
      width: '100%',
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-ambient)',
      padding: 'var(--space-3) var(--pad-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 'var(--annotation-bar-width)',
      alignSelf: 'stretch',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--ring-accent)',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-ui)',
      color: 'var(--fg-primary)',
      letterSpacing: 'var(--tracking-tight)',
      ...(expanded ? null : {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      })
    }
  }, message), meta && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-1) 0 0',
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)'
    }
  }, meta), expanded && actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-3)'
    }
  }, actions)), onToggle && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onToggle,
    "aria-expanded": expanded,
    style: {
      background: 'none',
      border: 0,
      color: 'var(--fg-muted)',
      font: 'var(--type-meta)',
      cursor: 'pointer',
      padding: 'var(--space-1)'
    }
  }, expanded ? 'Collapse' : 'Expand'));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Toast.jsx", error: String((e && e.message) || e) }); }

// components/doc/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CodeBlock({
  code,
  label,
  reservedHeight,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), label && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase'
    }
  }, label), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      minHeight: reservedHeight,
      boxSizing: 'border-box',
      overflowX: 'auto',
      background: 'var(--surface-inset)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderRadius: 'var(--radius)',
      padding: 'var(--space-4)',
      font: 'var(--type-code)',
      color: 'var(--fg-secondary)'
    }
  }, /*#__PURE__*/React.createElement("code", null, code)));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/doc/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/doc/DocCanvas.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DocCanvas({
  title,
  meta,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("main", _extends({
    style: {
      width: '100%',
      maxWidth: 'var(--measure-doc-max)',
      margin: '0 auto',
      padding: 'var(--space-10) var(--space-6) var(--space-20)',
      font: 'var(--type-body)',
      color: 'var(--fg-primary)',
      letterSpacing: 'var(--tracking-tight)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--block-flow)',
      ...style
    }
  }, rest), (title || meta) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, title && /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--type-doc-title)',
      color: 'var(--fg-primary)'
    }
  }, title), meta && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-code)',
      color: 'var(--fg-muted)'
    }
  }, meta)), children);
}
Object.assign(__ds_scope, { DocCanvas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/doc/DocCanvas.jsx", error: String((e && e.message) || e) }); }

// components/doc/ShortcutsDialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const rows = [{
  keys: ['Shift', '?'],
  label: 'Show this shortcut guide'
}, {
  keys: ['Enter'],
  label: 'Open the note editor on the focused block'
}, {
  keys: ['Esc'],
  label: 'Close the editor, keeping the draft'
}, {
  keys: ['⌘', 'Enter'],
  label: 'Submit the batch to the local queue'
}, {
  keys: ['⌘', 'K'],
  label: 'Focus the composer'
}, {
  keys: ['J', 'K'],
  label: 'Move between annotated blocks'
}];
const Key = ({
  children
}) => /*#__PURE__*/React.createElement("kbd", {
  style: {
    font: 'var(--type-code)',
    fontSize: 'var(--text-xs)',
    color: 'var(--fg-secondary)',
    background: 'var(--surface-inset)',
    border: 'var(--border-width) solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 var(--space-2)',
    minWidth: '1.25rem',
    display: 'inline-flex',
    justifyContent: 'center'
  }
}, children);
function ShortcutsDialog({
  open = false,
  items,
  onClose,
  style,
  ...rest
}) {
  if (!open) return null;
  const list = items || rows;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(0,0,0,0.5)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Keyboard shortcuts",
    onClick: e => e.stopPropagation(),
    onKeyDown: e => {
      if (e.key === 'Escape' && onClose) onClose();
    },
    style: {
      width: '26rem',
      maxWidth: 'calc(100% - var(--space-8))',
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-popover)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--type-subheading)',
      color: 'var(--fg-primary)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "Keyboard shortcuts"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)'
    }
  }, "Shift + ?")), /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 'var(--space-3) var(--space-4)',
      alignItems: 'center'
    }
  }, list.map(r => /*#__PURE__*/React.createElement(React.Fragment, {
    key: r.label
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)'
    }
  }, r.keys.map(k => /*#__PURE__*/React.createElement(Key, {
    key: k
  }, k))), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      font: 'var(--type-ui)',
      color: 'var(--fg-secondary)'
    }
  }, r.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "secondary",
    onClick: onClose
  }, "Close"))));
}
Object.assign(__ds_scope, { ShortcutsDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/doc/ShortcutsDialog.jsx", error: String((e && e.message) || e) }); }

// components/doc/ThemeToggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ThemeToggle({
  theme = 'dark',
  onChange,
  lightIcon,
  darkIcon,
  style,
  ...rest
}) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    label: 'Switch to ' + next + ' theme',
    onClick: () => onChange && onChange(next),
    icon: theme === 'dark' ? darkIcon || /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        font: 'var(--type-code)'
      }
    }, "\u25D0") : lightIcon || /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        font: 'var(--type-code)'
      }
    }, "\u25D1")
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)'
    }
  }, theme));
}
Object.assign(__ds_scope, { ThemeToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/doc/ThemeToggle.jsx", error: String((e && e.message) || e) }); }

// components/review/AnnotatedBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AnnotatedBlock({
  count = 0,
  status = 'unresolved',
  active = false,
  selectable = true,
  onSelect,
  children,
  style,
  ...rest
}) {
  const annotated = count > 0;
  const orphaned = status === 'orphaned';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: selectable ? 'button' : undefined,
    tabIndex: selectable ? 0 : undefined,
    onClick: onSelect,
    onKeyDown: selectable && onSelect ? e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(e);
      }
    } : undefined,
    style: {
      position: 'relative',
      cursor: selectable ? 'text' : 'default',
      borderLeft: 'var(--annotation-bar-width) ' + (orphaned ? 'dashed' : 'solid') + ' ' + (annotated ? orphaned ? 'var(--status-orphaned)' : 'var(--annotation-bar)' : 'transparent'),
      background: annotated && !orphaned ? active ? 'var(--annotation-tint-strong)' : 'var(--annotation-tint)' : 'transparent',
      paddingLeft: 'var(--space-4)',
      marginLeft: 'calc(-1 * var(--space-4) - var(--annotation-bar-width))',
      paddingTop: 'var(--space-1)',
      paddingBottom: 'var(--space-1)',
      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), children, annotated && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 'var(--space-1)',
      right: 'calc(-1 * var(--space-8))',
      font: 'var(--type-code)',
      fontSize: 'var(--text-xs)',
      color: orphaned ? 'var(--status-orphaned)' : 'var(--ring-accent)'
    }
  }, count));
}
Object.assign(__ds_scope, { AnnotatedBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/AnnotatedBlock.jsx", error: String((e && e.message) || e) }); }

// components/review/AnnotationList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AnnotationList({
  items = [],
  onSelect,
  onRemove,
  emptyLabel = 'No notes queued.',
  style,
  ...rest
}) {
  if (!items.length) {
    return /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: 'var(--type-meta)',
        color: 'var(--fg-muted)',
        padding: 'var(--space-3)'
      }
    }, emptyLabel);
  }
  return /*#__PURE__*/React.createElement("ul", _extends({
    "aria-label": "Pending review notes",
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      ...style
    }
  }, rest), items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.id,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      background: 'var(--surface-inset)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderLeft: 'var(--annotation-bar-width) solid var(--annotation-bar)',
      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
      padding: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(it),
    style: {
      background: 'none',
      border: 0,
      padding: 0,
      textAlign: 'left',
      cursor: 'pointer',
      font: 'var(--type-code)',
      color: 'var(--fg-secondary)',
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%'
    }
  }, "\u201C", it.quote, "\u201D"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-1) 0 0',
      font: 'var(--type-ui)',
      color: 'var(--fg-primary)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, it.comment), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-1) 0 0',
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)'
    }
  }, it.scope)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: it.status || 'unresolved'
  }), onRemove && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    size: "sm",
    label: 'Remove note on ' + it.quote,
    icon: /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        font: 'var(--type-code)'
      }
    }, "\xD7"),
    onClick: () => onRemove(it)
  })))));
}
Object.assign(__ds_scope, { AnnotationList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/AnnotationList.jsx", error: String((e && e.message) || e) }); }

// components/review/AnnotationPopover.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AnnotationPopover({
  quote,
  anchorNote,
  value = '',
  status,
  onChange,
  onSave,
  onCancel,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-label": "Add review note",
    "aria-modal": "false",
    onKeyDown: e => {
      if (e.key === 'Escape' && onCancel) onCancel();
    },
    style: {
      width: '26rem',
      maxWidth: '100%',
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-popover)',
      padding: 'var(--pad-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--fg-muted)'
    }
  }, "Review note"), status && /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status
  })), quote && /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      paddingLeft: 'var(--space-3)',
      borderLeft: 'var(--annotation-bar-width) solid var(--annotation-bar)',
      font: 'var(--type-code)',
      color: 'var(--fg-secondary)'
    }
  }, quote), anchorNote && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-meta)',
      color: 'var(--fg-muted)'
    }
  }, anchorNote), /*#__PURE__*/React.createElement("textarea", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    placeholder: "What should the agent change here?",
    rows: 3,
    style: {
      resize: 'vertical',
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-inset)',
      color: 'var(--fg-primary)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-3)',
      font: 'var(--type-body)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "ghost",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "primary",
    onClick: onSave,
    disabled: !value.trim()
  }, "Attach note")));
}
Object.assign(__ds_scope, { AnnotationPopover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/AnnotationPopover.jsx", error: String((e && e.message) || e) }); }

// components/review/ConfirmDialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ConfirmDialog({
  open = true,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onKeyDown: e => {
      if (e.key === 'Escape' && onCancel) onCancel();
    },
    style: {
      width: '24rem',
      maxWidth: 'calc(100% - var(--space-8))',
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-popover)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: 'var(--type-subheading)',
      color: 'var(--fg-primary)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body)',
      color: 'var(--fg-muted)'
    }
  }, description), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      justifyContent: 'flex-end',
      marginTop: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "danger",
    onClick: onConfirm
  }, confirmLabel))));
}
Object.assign(__ds_scope, { ConfirmDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/ConfirmDialog.jsx", error: String((e && e.message) || e) }); }

// components/review/FloatingComposer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FloatingComposer({
  value = '',
  onChange,
  onSubmit,
  noteCount = 0,
  selection,
  queueOpen = false,
  onToggleQueue,
  queueIcon,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "region",
    "aria-label": "Review composer",
    style: {
      position: 'sticky',
      bottom: 'var(--composer-inset)',
      zIndex: 20,
      width: 'min(46rem,100%)',
      margin: '0 auto',
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-composer)',
      padding: 'var(--space-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), (noteCount > 0 || selection) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--gap-inline)',
      alignItems: 'center'
    }
  }, noteCount > 0 && /*#__PURE__*/React.createElement(__ds_scope.Chip, {
    tone: "accent",
    count: noteCount
  }, "notes attached"), selection && /*#__PURE__*/React.createElement(__ds_scope.Chip, null, "\u201C", selection, "\u201D")), queueOpen && children, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 'var(--space-2)'
    }
  }, onToggleQueue && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    label: queueOpen ? 'Hide review queue' : 'Show review queue',
    active: queueOpen,
    onClick: onToggleQueue,
    icon: queueIcon || /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        font: 'var(--type-code)'
      }
    }, "\u2261")
  }), /*#__PURE__*/React.createElement("textarea", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    rows: 1,
    placeholder: "Add an instruction for the agent\u2026",
    style: {
      flex: 1,
      resize: 'none',
      minHeight: 'var(--tap-min)',
      boxSizing: 'border-box',
      background: 'var(--surface-inset)',
      color: 'var(--fg-primary)',
      border: 'var(--border-width) solid var(--border-subtle)',
      borderRadius: 'var(--radius)',
      padding: 'var(--space-3)',
      font: 'var(--type-body)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: onSubmit,
    disabled: !value.trim() && noteCount === 0
  }, "Submit")));
}
Object.assign(__ds_scope, { FloatingComposer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/FloatingComposer.jsx", error: String((e && e.message) || e) }); }

// components/review/StatusRegion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatusRegion({
  message,
  tone = 'neutral',
  style,
  ...rest
}) {
  const colors = {
    neutral: 'var(--fg-muted)',
    progress: 'var(--status-in-progress)',
    success: 'var(--status-resolved)',
    warning: 'var(--status-orphaned)',
    error: 'var(--status-unresolved)'
  };
  return /*#__PURE__*/React.createElement("p", _extends({
    role: "status",
    "aria-live": "polite",
    style: {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      font: 'var(--type-meta)',
      color: colors[tone],
      letterSpacing: 'var(--tracking-tight)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      font: 'var(--type-code)'
    }
  }, "\u203A"), message);
}
Object.assign(__ds_scope, { StatusRegion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/review/StatusRegion.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wc-view-review/CliPanel.jsx
try { (() => {
const {
  CodeBlock,
  Button,
  StatusRegion
} = window.WcViewDesignSystem_136191;
function CliPanel({
  notes,
  onClaim,
  onClose
}) {
  const payload = JSON.stringify(notes.map(n => ({
    id: n.id,
    anchor: {
      exact: n.quote,
      prefix: n.prefix,
      scope: n.scope
    },
    comment: n.comment,
    severity: 'note',
    status: n.status
  })), null, 1);
  return /*#__PURE__*/React.createElement("section", {
    "aria-label": "CLI feedback payload",
    style: {
      background: 'var(--surface-card)',
      border: 'var(--border-width) solid var(--border-strong)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-ambient)',
      padding: 'var(--pad-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      font: 'var(--type-code)',
      color: 'var(--fg-muted)'
    }
  }, "$ wc-view feedback --unresolved"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: onClose
  }, "Close")), /*#__PURE__*/React.createElement(CodeBlock, {
    reservedHeight: "10rem",
    code: notes.length ? payload : '[]'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(StatusRegion, {
    tone: notes.length ? 'progress' : 'neutral',
    message: notes.length ? notes.length + ' item(s) pulled by the agent' : 'Queue empty — nothing unresolved'
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    disabled: !notes.length,
    onClick: onClaim
  }, "Mark in_progress")));
}
Object.assign(window, {
  CliPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wc-view-review/CliPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wc-view-review/DocumentBody.jsx
try { (() => {
const {
  AnnotatedBlock,
  CodeBlock
} = window.WcViewDesignSystem_136191;
const H = ({
  children
}) => /*#__PURE__*/React.createElement("h2", {
  style: {
    margin: 'var(--space-6) 0 0',
    font: 'var(--type-heading)',
    color: 'var(--fg-primary)',
    letterSpacing: 'var(--tracking-tight)'
  }
}, children);
const blocks = [{
  id: 'b1',
  kind: 'h',
  text: 'Context'
}, {
  id: 'b2',
  kind: 'p',
  text: 'workflow-contract keeps Markdown documents as the authority for proposals, design, planning, and execution.'
}, {
  id: 'b3',
  kind: 'p',
  text: 'CLI-agent users must currently locate and read Markdown in an editor or host-specific artifact UI. The same review surface must work with Codex, Claude Code, Pi, OpenCode, Cursor, and Antigravity.'
}, {
  id: 'b4',
  kind: 'h',
  text: 'Proposed Change'
}, {
  id: 'b5',
  kind: 'p',
  text: 'Render Markdown files or a docs/ tree in a lightweight localhost browser UI. Keep Markdown and explicit human acceptance authoritative — browser feedback is unapproved input.'
}, {
  id: 'b6',
  kind: 'p',
  text: 'Bind each annotation with a layered anchor, resolved by ordered fallback: quote + context first, structural scope as a narrower, position hint only as a re-validated cache.'
}, {
  id: 'b7',
  kind: 'code',
  label: 'queue.jsonl',
  text: '{"id":"a3f","anchor":{"exact":"layered anchor","prefix":"Bind each annotation with a ","suffix":", resolved by ordered fal"},"scope":"proposed-change#p2","comment":"Name the 32-char window as a constant.","severity":"note","status":"unresolved"}'
}, {
  id: 'b8',
  kind: 'h',
  text: 'Open Decisions'
}, {
  id: 'b9',
  kind: 'p',
  text: 'Feedback retention lifecycle and wc-view gc automatic cleanup triggers.'
}, {
  id: 'b10',
  kind: 'p',
  text: 'Queue mutation model: append-only JSONL with folded state-transition events vs Maildir-style file moves for in-place status changes.'
}];
function DocumentBody({
  notesByBlock,
  activeId,
  onSelect
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, blocks.map(b => {
    if (b.kind === 'h') return /*#__PURE__*/React.createElement(H, {
      key: b.id
    }, b.text);
    const notes = notesByBlock[b.id] || [];
    const status = notes.length ? notes[notes.length - 1].status : 'unresolved';
    return /*#__PURE__*/React.createElement(AnnotatedBlock, {
      key: b.id,
      count: notes.length,
      status: status,
      active: activeId === b.id,
      onSelect: () => onSelect(b)
    }, b.kind === 'code' ? /*#__PURE__*/React.createElement(CodeBlock, {
      label: b.label,
      reservedHeight: "7rem",
      code: b.text
    }) : /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: 'var(--type-body)',
        color: 'var(--fg-secondary)'
      }
    }, b.text));
  }));
}
Object.assign(window, {
  DocumentBody,
  docBlocks: blocks
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wc-view-review/DocumentBody.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wc-view-review/ReviewSurface.jsx
try { (() => {
const {
  DocCanvas,
  FloatingComposer,
  AnnotationList,
  AnnotationPopover,
  ConfirmDialog,
  Toast,
  ThemeToggle,
  StatusRegion,
  IconButton,
  ShortcutsDialog
} = window.WcViewDesignSystem_136191;
const Ic = ({
  n
}) => /*#__PURE__*/React.createElement("i", {
  "data-lucide": n
});
let seq = 0;
function ReviewSurface() {
  const [theme, setTheme] = React.useState('dark');
  const [notes, setNotes] = React.useState([]);
  const [target, setTarget] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [queueOpen, setQueueOpen] = React.useState(false);
  const [cli, setCli] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [help, setHelp] = React.useState(false);
  const [toast, setToast] = React.useState({
    msg: 'Reading docs/changes/proposed/wc-view-local-markdown-review-surface.md',
    meta: 'proposed · 9.8 kB · watching for changes'
  });
  const [toastOpen, setToastOpen] = React.useState(false);
  const [status, setStatus] = React.useState({
    tone: 'neutral',
    msg: 'Select any paragraph to attach a review note.'
  });
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  React.useEffect(() => {
    window.lucide && window.lucide.createIcons();
  });
  React.useEffect(() => {
    const onKey = e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if (e.key === '?' && !typing) {
        e.preventDefault();
        setHelp(true);
      }
      if (e.key === 'Escape') setHelp(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const notesByBlock = notes.reduce((acc, n) => {
    (acc[n.blockId] = acc[n.blockId] || []).push(n);
    return acc;
  }, {});
  const attach = () => {
    const quote = target.text.split(' ').slice(0, 4).join(' ');
    setNotes([...notes, {
      id: 'n' + ++seq,
      blockId: target.id,
      quote,
      prefix: target.text.slice(0, 32),
      comment: draft,
      scope: '§ ' + target.id,
      status: 'unresolved'
    }]);
    setStatus({
      tone: 'success',
      msg: 'Note attached to “' + quote + '” — not yet submitted.'
    });
    setTarget(null);
    setDraft('');
  };
  const submit = () => {
    const n = notes.length;
    setStatus({
      tone: 'success',
      msg: n + ' note(s) + instruction written atomically to ~/.wc-view/feedback/queue.jsonl'
    });
    setToast({
      msg: 'Submitted ' + n + ' annotation(s) to the local queue',
      meta: 'agent may pull with wc-view feedback --unresolved'
    });
    setPrompt('');
    setQueueOpen(false);
    setCli(true);
  };
  const claim = () => {
    setNotes(notes.map(x => ({
      ...x,
      status: x.status === 'unresolved' ? 'in_progress' : x.status
    })));
    setStatus({
      tone: 'progress',
      msg: 'Agent claimed the batch — status in_progress'
    });
    setToast({
      msg: 'Agent claimed ' + notes.length + ' note(s); proposing document edits',
      meta: 'reconcile loop: unresolved → in_progress'
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-4) var(--space-6) 0',
      background: 'linear-gradient(var(--bg-base) 70%, transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
      width: 'min(46rem,100%)'
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    message: toast.msg,
    meta: toast.meta,
    expanded: toastOpen,
    onToggle: () => setToastOpen(!toastOpen)
  }), /*#__PURE__*/React.createElement(ThemeToggle, {
    theme: theme,
    onChange: setTheme,
    darkIcon: /*#__PURE__*/React.createElement(Ic, {
      n: "moon"
    }),
    lightIcon: /*#__PURE__*/React.createElement(Ic, {
      n: "sun"
    })
  }))), /*#__PURE__*/React.createElement(DocCanvas, {
    title: "wc-view: local Markdown review surface",
    meta: "docs/changes/proposed/wc-view-local-markdown-review-surface.md \xB7 proposed"
  }, /*#__PURE__*/React.createElement(DocumentBody, {
    notesByBlock: notesByBlock,
    activeId: target && target.id,
    onSelect: b => {
      setTarget(b);
      setDraft('');
    }
  }), target && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(AnnotationPopover, {
    quote: target.text.slice(0, 60) + '…',
    anchorNote: '§ ' + target.id + ' › ' + (target.kind === 'code' ? 'code block' : 'paragraph'),
    value: draft,
    onChange: setDraft,
    onSave: attach,
    onCancel: () => setTarget(null),
    status: "unresolved"
  })), cli && /*#__PURE__*/React.createElement(CliPanel, {
    notes: notes,
    onClaim: claim,
    onClose: () => setCli(false)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      padding: '0 var(--space-6) var(--composer-inset)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 'min(46rem,100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(StatusRegion, {
    tone: status.tone,
    message: status.msg
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    label: "Keyboard shortcuts (Shift + ?)",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "keyboard"
    }),
    onClick: () => setHelp(true)
  }), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    label: "Show CLI payload",
    active: cli,
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "terminal"
    }),
    onClick: () => setCli(!cli)
  }), /*#__PURE__*/React.createElement(IconButton, {
    size: "sm",
    label: "Discard queued notes",
    icon: /*#__PURE__*/React.createElement(Ic, {
      n: "trash-2"
    }),
    onClick: () => notes.length && setDialog(true)
  }))), /*#__PURE__*/React.createElement(FloatingComposer, {
    value: prompt,
    onChange: setPrompt,
    onSubmit: submit,
    noteCount: notes.length,
    selection: target ? target.text.split(' ').slice(0, 4).join(' ') : undefined,
    queueOpen: queueOpen,
    onToggleQueue: () => setQueueOpen(!queueOpen),
    queueIcon: /*#__PURE__*/React.createElement(Ic, {
      n: "list"
    })
  }, /*#__PURE__*/React.createElement(AnnotationList, {
    items: notes,
    onSelect: it => setTarget(window.docBlocks.find(b => b.id === it.blockId)),
    onRemove: it => setNotes(notes.filter(n => n.id !== it.id)),
    emptyLabel: "No notes queued \u2014 click a paragraph in the document to start."
  }))), /*#__PURE__*/React.createElement(ShortcutsDialog, {
    open: help,
    onClose: () => setHelp(false)
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: dialog,
    title: 'Discard ' + notes.length + ' queued note(s)?',
    description: "Unsubmitted notes are never written to ~/.wc-view/feedback/queue.jsonl.",
    confirmLabel: "Discard",
    onCancel: () => setDialog(false),
    onConfirm: () => {
      setNotes([]);
      setDialog(false);
      setStatus({
        tone: 'warning',
        msg: 'Queue discarded.'
      });
    }
  }));
}
Object.assign(window, {
  ReviewSurface
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wc-view-review/ReviewSurface.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.DocCanvas = __ds_scope.DocCanvas;

__ds_ns.ShortcutsDialog = __ds_scope.ShortcutsDialog;

__ds_ns.ThemeToggle = __ds_scope.ThemeToggle;

__ds_ns.AnnotatedBlock = __ds_scope.AnnotatedBlock;

__ds_ns.AnnotationList = __ds_scope.AnnotationList;

__ds_ns.AnnotationPopover = __ds_scope.AnnotationPopover;

__ds_ns.ConfirmDialog = __ds_scope.ConfirmDialog;

__ds_ns.FloatingComposer = __ds_scope.FloatingComposer;

__ds_ns.StatusRegion = __ds_scope.StatusRegion;

})();
