export function resolveImageUrl(value) {
    const image = String(value || '').trim();

    if (!image) {
        return null;
    }

    const driveFile = image.match(/^https?:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{20,200})/i);
    const driveQuery = image.match(/^https?:\/\/drive\.google\.com\/(?:open|uc|thumbnail)\?.*\bid=([A-Za-z0-9_-]{20,200})/i);
    const rawDriveId = /^[A-Za-z0-9_-]{20,200}$/.test(image) ? image : null;
    const driveId = driveFile?.[1] || driveQuery?.[1] || rawDriveId;
    if (driveId) {
        return `/sheets-berita/drive-image/${encodeURIComponent(driveId)}`;
    }

    if (/^https?:\/\//i.test(image) || image.startsWith('/')) {
        return image;
    }

    return `/storage/${image.replace(/^storage\//i, '')}`;
}

export function sanitizeArticleHtml(value) {
    if (typeof document === 'undefined') {
        return String(value || '');
    }

    const template = document.createElement('template');
    template.innerHTML = String(value || '');
    const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'P', 'DIV', 'BR', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'A', 'IMG']);

    const clean = (node) => {
        [...node.childNodes].forEach((child) => {
            if (child.nodeType !== Node.ELEMENT_NODE) {
                return;
            }

            if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)) {
                child.remove();
                return;
            }

            clean(child);

            if (child.tagName === 'A') {
                const href = child.getAttribute('href') || '';
                if (!/^https?:\/\//i.test(href)) {
                    child.replaceWith(...child.childNodes);
                    return;
                }
                child.setAttribute('target', '_blank');
                child.setAttribute('rel', 'noopener noreferrer');
            } else if (child.tagName === 'IMG') {
                const src = child.getAttribute('src') || '';
                if (!/^https?:\/\//i.test(src)) {
                    child.remove();
                    return;
                }
                child.setAttribute('alt', 'Gambar artikel');
                child.className = 'my-4 max-h-96 w-auto rounded-lg object-contain';
            }

            const textAlign = child.getAttribute('style')?.match(/^\s*text-align:\s*(left|center|right|justify)\s*;?\s*$/i)?.[1];
            if (textAlign) {
                child.setAttribute('style', `text-align: ${textAlign.toLowerCase()};`);
            }

            [...child.attributes].forEach((attribute) => {
                if (!['href', 'target', 'rel', 'src', 'alt', 'class'].includes(attribute.name)
                    && (attribute.name !== 'style' || !textAlign)) {
                    child.removeAttribute(attribute.name);
                }
            });

            if (!allowedTags.has(child.tagName)) {
                child.replaceWith(...child.childNodes);
            }
        });
    };

    clean(template.content);
    return template.innerHTML;
}

function isRichText(value) {
    return /<\/?(?:b|strong|i|em|u|s|p|div|br|h2|h3|blockquote|ul|ol|li|a|img)\b/i.test(String(value || ''));
}

export function ArticleContent({ content }) {
    if (isRichText(content)) {
        return (
            <div
                className="space-y-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_a]:text-perhutani-700 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(content) }}
            />
        );
    }

    const paragraphs = String(content || '')
        .trim()
        .split(/\r?\n\s*\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (paragraphs.length === 0) {
        return <p>Konten belum diisi.</p>;
    }

    return paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 20)}`} className={index > 0 ? 'mt-4' : ''}>
            {paragraph}
        </p>
    ));
}
