import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  query: z.string().min(1, 'Enter a movie title'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    onSearch(values.query);
  };

  const handleClear = () => {
    reset();
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <Input
        {...register('query')}
        placeholder="Search movies..."
        className="w-48"
      />
      <Button type="submit" size="sm">Search</Button>
      <Button type="button" size="sm" variant="outline" onClick={handleClear}>
        Clear
      </Button>
    </form>
  );
}
