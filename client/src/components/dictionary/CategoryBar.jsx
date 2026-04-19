import { CATEGORIES } from '../../data/dictionaryCategories';
import CategoryTile from './CategoryTile';

export default function CategoryBar({ activeCat, onCategorySelect, progressForCategory }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 4,
      marginBottom: '1.25rem',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {CATEGORIES.map(cat => (
        <CategoryTile
          key={cat.id}
          category={cat}
          isActive={activeCat === cat.id}
          progress={progressForCategory(cat.id)}
          onClick={() => onCategorySelect(cat.id)}
        />
      ))}
    </div>
  );
}
