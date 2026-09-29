import { useEffect, useRef, useState } from 'react';

export default function ImageUpload({
    value,
    onChange,
    error,
    existingUrl = null,
    label = 'Gambar',
}) {
    const [preview, setPreview] = useState(existingUrl);
    const inputRef = useRef(null);

    useEffect(() => {
        setPreview(existingUrl);
    }, [existingUrl]);

    useEffect(() => () => {
        if (preview?.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
    }, [preview]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi client-side (biar cepat)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('Ukuran gambar maksimal 2 MB');
            return;
        }

        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            alert('Format harus JPG, JPEG, PNG, atau WEBP');
            return;
        }

        onChange(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div>
            <label htmlFor="image-upload" className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} <span className="text-gray-400 font-normal">(opsional, maks 2 MB)</span>
            </label>

            {preview && (
                <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-48 w-full object-cover sm:h-56"
                    />
                    <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-2">
                        <span className="text-xs text-gray-500">Gambar terpilih</span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                            title="Hapus gambar"
                        >
                            Hapus gambar
                        </button>
                    </div>
                </div>
            )}

            {/* Upload area */}
            <label
                htmlFor="image-upload"
                className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
                    ${error
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-perhutani-500 hover:bg-perhutani-50'
                    }`}
            >
                <input
                    id="image-upload"
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {!preview && (
                    <>
                        <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                            Klik untuk pilih gambar
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPG, JPEG, PNG, WEBP (maks 2 MB)
                        </p>
                    </>
                )}

                {preview && (
                    <p className="text-xs text-gray-500">
                        Klik untuk ganti gambar
                    </p>
                )}
            </label>

            {error && (
                <p className="mt-1.5 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}
