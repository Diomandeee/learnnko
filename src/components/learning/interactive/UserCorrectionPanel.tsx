'use client';

import { useState } from 'react';
import { FrameData } from '@/lib/learning/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { NkoTextDisplay } from '../nko/NkoTextDisplay';
import { Loader2 } from 'lucide-react';

interface CorrectionPanelProps {
    currentFrame: FrameData | null;
    onSubmitCorrection: (correction: any) => Promise<void>;
}

export function UserCorrectionPanel({ currentFrame, onSubmitCorrection }: CorrectionPanelProps) {
    const [correctedNko, setCorrectedNko] = useState('');
    const [correctionType, setCorrectionType] = useState<'spelling' | 'tone' | 'meaning' | 'other'>('spelling');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If no frame is selected/active, show placeholder
    if (!currentFrame) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
                Select a frame or wait for stream to provide feedback.
            </div>
        );
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmitCorrection({
                frameId: currentFrame.frameId,
                originalNko: currentFrame.content.nkoText,
                correctedNko,
                correctionType,
                timestamp: Date.now(),
            });
            setCorrectedNko('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Help the AI Learn</h3>

            <div className="space-y-4">
                {/* Original content */}
                <div className="bg-muted/50 p-3 rounded-lg">
                    <label className="text-xs text-muted-foreground block mb-1">AI's Attempt</label>
                    <NkoTextDisplay
                        text={currentFrame.content.nkoText}
                        size="sm"
                    />
                </div>

                {/* Correction type */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">What needs fixing?</label>
                    <RadioGroup
                        value={correctionType}
                        onValueChange={(v) => setCorrectionType(v as 'spelling' | 'tone' | 'meaning' | 'other')}
                        className="grid grid-cols-2 gap-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="spelling" id="r-spelling" />
                            <Label htmlFor="r-spelling">Spelling</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tone" id="r-tone" />
                            <Label htmlFor="r-tone">Tone marks</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="meaning" id="r-meaning" />
                            <Label htmlFor="r-meaning">Meaning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="r-other" />
                            <Label htmlFor="r-other">Other</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Correction input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Correction</label>
                    <div className="relative">
                        <Textarea
                            value={correctedNko}
                            onChange={(e) => setCorrectedNko(e.target.value)}
                            className="font-nko text-xl text-right min-h-[100px]"
                            dir="rtl"
                            placeholder="ߒߞߏ ߛߓߍ..."
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute bottom-2 left-2 text-xs h-7"
                            onClick={() => alert("Keyboard feature coming soon")}
                        >
                            ⌨️ N'Ko Keyboard
                        </Button>
                    </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={!correctedNko || isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Correction
                </Button>
            </div>
        </div>
    );
}
