import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { ValidationResult } from '@/lib/nko/validator';

export function NkoValidationBadge({ validation }: { validation: ValidationResult }) {
    if (validation.isValid) {
        return (
            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-3 h-3" />
                Valid N'Ko
            </Badge>
        );
    }

    return (
        <div className="space-y-2">
            <Badge variant="destructive" className="gap-1">
                <XCircle className="w-3 h-3" />
                {validation.errors.length} error(s)
            </Badge>

            <div className="text-xs space-y-1">
                {validation.errors.map((error, i) => (
                    <div key={i} className="flex items-center gap-2 text-destructive">
                        <span>Position {error.position}:</span>
                        <code className="bg-destructive/10 px-1 rounded">{error.char}</code>
                        <span>{error.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
