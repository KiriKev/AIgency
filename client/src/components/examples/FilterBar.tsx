import FilterBar from '../FilterBar';

export default function FilterBarExample() {
  return <FilterBar onFilterChange={(f) => console.log('Filters changed:', f)} />;
}
