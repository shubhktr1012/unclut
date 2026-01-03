"use client";
import React, { useState } from 'react';

interface OnboardingWizardProps {
    onComplete: () => Promise<void>;
    isOpen: boolean;
}

export default function OnboardingWizard({ onComplete, isOpen }: OnboardingWizardProps) {
    const [step, setStep] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to Unclut.ai",
            description: "Your inbox is about to get a whole lot cleaner. We help you identify promotional clutter and remove it in seconds.",
            icon: (
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center text-4xl mb-4">
                    👋
                </div>
            )
        },
        {
            title: "How it Works",
            description: "1. We scan your 'Promotions' category.\n2. You see a list of top senders.\n3. You choose to Unsubscribe or Delete all emails.",
            icon: (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-4">
                    🔍
                </div>
            )
        },
        {
            title: "Privacy First",
            description: "We only look at email metadata (sender, subject) to group them. We never read your personal conversations or share your data.",
            icon: (
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-4xl mb-4">
                    🔒
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        await onComplete();
        setIsCompleting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative">
                <div className="p-8 text-center flex flex-col items-center">
                    {currentStep.icon}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
                    <p className="text-gray-600 mb-8 whitespace-pre-line leading-relaxed">
                        {currentStep.description}
                    </p>

                    {/* Dots Indicator */}
                    <div className="flex gap-2 mb-8">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-teal-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={isCompleting}
                            className={`flex-[2] bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100 disabled:opacity-70 ${step === 0 ? 'w-full' : ''}`}
                        >
                            {isCompleting ? "Getting Started..." : (step === steps.length - 1 ? "Let's Go!" : "Next")}
                        </button>
                    </div>

                    {step < steps.length - 1 && (
                        <button
                            onClick={() => setStep(steps.length - 1)}
                            className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
                        >
                            Skip to end
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
