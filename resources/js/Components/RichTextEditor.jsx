import { useEffect, useRef, useState } from 'react';
import { sanitizeArticleHtml } from '@/utils/article.jsx';

const toolbar = [
    { command: 'bold', label: 'B', title: 'Tebal', className: 'font-bold' },
    { command: 'italic', label: 'I', title: 'Miring', className: 'font-serif italic' },
    { command: 'underline', label: 'U', title: 'Garis bawah', className: 'underline' },
    { command: 'strikeThrough', label: 'S', title: 'Coret', className: 'line-through' },
    { command: 'justifyLeft', label: 'Kiri', title: 'Rata kiri' },
    { command: 'justifyCenter', label: 'Tengah', title: 'Rata tengah' },
    { command: 'justifyRight', label: 'Kanan', title: 'Rata kanan' },
    { command: 'justifyFull', label: 'Kanan kiri', title: 'Rata kanan kiri' },
    { command: 'removeFormat', label: 'Bersihkan', title: 'Hapus format' },
];

export default function RichTextEditor({ value, onChange, error, placeholder, minHeight = 'min-h-32' }) {
    const editorRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const sanitized = sanitizeArticleHtml(value || '');

        if (editorRef.current && editorRef.current.innerHTML !== sanitized) {
            editorRef.current.innerHTML = sanitized;
        }
    }, [value]);

    const updateValue = () => {
        const editor = editorRef.current;
        const sanitized = sanitizeArticleHtml(editor?.innerHTML || '');

        if (editor && editor.innerHTML !== sanitized) {
            editor.innerHTML = sanitized;
        }

        onChange(sanitized);
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const html = event.clipboardData.getData('text/html');
        const text = event.clipboardData.getData('text/plain');

        if (html) {
            document.execCommand('insertHTML', false, sanitizeArticleHtml(html));
        } else {
            document.execCommand('insertText', false, text);
        }

        updateValue();
    };

    const execute = (item) => {
        editorRef.current?.focus();
        const commandValue = item.command === 'formatBlock' && item.value
            ? `<${item.value}>`
            : item.value || null;
        document.execCommand(item.command, false, commandValue);
        updateValue();
    };

    const insertLink = () => {
        const url = window.prompt('Masukkan URL tautan:');
        if (!url?.trim()) {
            return;
        }

        editorRef.current?.focus();
        document.execCommand('createLink', false, url.trim());
        updateValue();
    };

    const insertImage = () => {
        const url = window.prompt('Masukkan URL gambar publik:');
        if (!url?.trim()) {
            return;
        }

        editorRef.current?.focus();
        document.execCommand('insertImage', false, url.trim());
        updateValue();
    };

    const editorClass = isFullscreen
        ? 'fixed inset-4 z-50 flex max-h-none flex-col shadow-2xl'
        : 'relative';

    return (
        <>
            {isFullscreen && (
                <div className="fixed inset-0 z-40 bg-gray-900/40" onClick={() => setIsFullscreen(false)} />
            )}
            <div className={`${editorClass} overflow-hidden rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
                <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
                    <button type="button" title="Urungkan" aria-label="Urungkan" onMouseDown={(event) => event.preventDefault()} onClick={() => execute({ command: 'undo' })} className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-white hover:text-perhutani-700">↶</button>
                    <button type="button" title="Ulangi" aria-label="Ulangi" onMouseDown={(event) => event.preventDefault()} onClick={() => execute({ command: 'redo' })} className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-white hover:text-perhutani-700">↷</button>
                    <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />
                {toolbar.map((item) => (
                    <button
                        key={`${item.command}-${item.value || ''}`}
                        type="button"
                        title={item.title}
                        aria-label={item.title}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => execute(item)}
                        className={`rounded px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-white hover:text-perhutani-700 ${item.className || ''}`}
                    >
                        {item.label}
                    </button>
                ))}
                    <button type="button" title="Sisipkan tautan" aria-label="Sisipkan tautan" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} className="rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white hover:text-perhutani-700">Tautan</button>
                    <button type="button" title="Sisipkan gambar dari URL" aria-label="Sisipkan gambar dari URL" onMouseDown={(event) => event.preventDefault()} onClick={insertImage} className="rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white hover:text-perhutani-700">Gambar</button>
                    <button type="button" title="Layar penuh" aria-label="Layar penuh" onClick={() => setIsFullscreen((current) => !current)} className="ml-auto rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-white hover:text-perhutani-700">{isFullscreen ? 'Tutup' : 'Layar penuh'}</button>
                </div>
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder={placeholder}
                    onInput={updateValue}
                    onPaste={handlePaste}
                    className={`${minHeight} ${isFullscreen ? 'flex-1 max-h-none' : 'max-h-96'} overflow-y-auto px-3.5 py-3 text-sm leading-relaxed text-gray-700 outline-none empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]`}
                />
                {error && <p className="px-3.5 pb-2 text-xs text-red-600">{error}</p>}
            </div>
        </>
    );
}
