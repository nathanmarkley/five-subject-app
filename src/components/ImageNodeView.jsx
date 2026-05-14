import { NodeViewWrapper } from '@tiptap/react'
import { useRef } from 'react'

export default function ImageNodeView({ node, updateAttributes, selected, deleteNode }) {
  const { src, alt, title, width, align } = node.attrs
  const imgRef = useRef(null)

  const startResize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.touches ? e.touches[0].clientX : e.clientX
    const startWidth = imgRef.current?.offsetWidth || 300

    const onMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX
      updateAttributes({ width: Math.max(50, Math.round(startWidth + (x - startX))) })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
  }

  const justifyMap = { center: 'center', right: 'flex-end', left: 'flex-start' }

  return (
    <NodeViewWrapper
      as="div"
      style={{ display: 'flex', justifyContent: justifyMap[align] || 'flex-start', lineHeight: 0, userSelect: 'none' }}
    >
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          draggable={false}
          style={{
            display: 'block',
            width: width ? `${width}px` : 'auto',
            maxWidth: '100%',
            outline: selected ? '2px solid #4a7fb5' : 'none',
            borderRadius: '2px',
          }}
        />

        {selected && (
          <div className="image-toolbar-overlay">
            <button
              className={`img-tool-btn ${!align || align === 'left' ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'left' }) }}
              title="Align left"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="9" height="2" rx="1"/><rect x="1" y="12" width="11" height="2" rx="1"/>
              </svg>
            </button>
            <button
              className={`img-tool-btn ${align === 'center' ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'center' }) }}
              title="Center"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="3.5" y="7" width="9" height="2" rx="1"/><rect x="2.5" y="12" width="11" height="2" rx="1"/>
              </svg>
            </button>
            <button
              className={`img-tool-btn ${align === 'right' ? 'active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: 'right' }) }}
              title="Align right"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="6" y="7" width="9" height="2" rx="1"/><rect x="4" y="12" width="11" height="2" rx="1"/>
              </svg>
            </button>
            <div className="img-tool-sep" />
            <button
              className="img-tool-btn img-delete-btn"
              onMouseDown={(e) => { e.preventDefault(); deleteNode() }}
              title="Delete image"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13" strokeLinecap="round">
                <polyline points="2 4 3.5 4 14 4"/><path d="M12.5 4l-.7 9H4.2L3.5 4"/><path d="M6.5 7v4M9.5 7v4"/><path d="M6 4V2.5h4V4"/>
              </svg>
            </button>
          </div>
        )}

        {selected && (
          <div
            className="image-resize-handle"
            onMouseDown={startResize}
            onTouchStart={startResize}
            title="Drag to resize"
          />
        )}
      </div>
    </NodeViewWrapper>
  )
}
