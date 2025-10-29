import { motion } from 'motion/react';
import { X } from 'lucide-react';

export function AboutPage({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-(--color-bg) rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-(--color-bg) border-b border-(--color-border) px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-(--color-text)">About</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-auto">
                    <div className="text-center">
                        <img src='/logo.svg' className="w-12 h-12 mx-auto mb-4 text-(--color-primary)" />
                        <h3 className="text-2xl font-bold text-(--color-text) mb-2">MiniDataManim</h3>
                        <p className="text-(--color-text-secondary)">Version 1.0.0</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-(--color-text)">
                            A lightweight, browser-based data manipulation and visualization tool for spreadsheets.
                        </p>

                        <div className="card">
                            <h4 className="font-semibold text-(--color-text) mb-2">Features</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-(--color-text-secondary)">
                                <li>Drag-and-drop file upload</li>
                                <li>Interactive data tables</li>
                                <li>Column statistics and insights</li>
                                <li>Data transformations</li>
                                <li>Export to multiple formats</li>
                            </ul>
                        </div>

                        <div className="card">
                            <h4 className="font-semibold text-(--color-text) mb-2">Technologies</h4>
                            <p className="text-sm text-(--color-text-secondary)">
                                Built with React, TypeScript, Tailwind CSS, and Motion
                            </p>
                        </div>

                        <div className="text-center pt-4 border-t border-(--color-border)">
                            <p className="text-sm text-(--color-text-secondary)">
                                © 2025 MiniDataManim. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
