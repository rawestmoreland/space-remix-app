// components/launches/status-filter.tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { ILaunchStatus } from '~/services/launchService';

interface StatusFilterProps {
  statuses: ILaunchStatus[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

export function StatusFilter({
  statuses,
  selectedStatus,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className='w-[200px]'>
        <SelectValue placeholder='Filter by status' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          <SelectItem value='all'>All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              {status.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
