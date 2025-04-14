import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";

interface AvailabilityData {
  totalOrdered: number;
  availableSlots: number;
  maxLimit: number;
  isAvailable: boolean;
}

interface Props {
  date: string;
  className?: string;
}

export function AvailabilityIndicator({ date, className }: Props) {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/available-slots?date=${date}`);
        const data = await response.json();
        if (data.success) {
          setAvailability(data.data);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchAvailability();
    }
  }, [date]);

  if (loading) {
    return <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>;
  }

  if (!availability) {
    return null;
  }

  const { totalOrdered, availableSlots, maxLimit } = availability;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={availableSlots > 0 ? "outline" : "destructive"}
        className="text-sm"
      >
        {availableSlots > 0 
          ? `${availableSlots} slots available` 
          : 'Fully booked'}
      </Badge>
      <span className="text-sm text-gray-500">
        ({totalOrdered}/{maxLimit} ordered)
      </span>
    </div>
  );
} 