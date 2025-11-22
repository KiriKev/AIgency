import PromptCard from '../PromptCard';

export default function PromptCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <PromptCard
        id="1"
        title="Cyberpunk Cityscape"
        artist="NeonArtist"
        price={5}
        isFree={false}
        rating={4.8}
        downloads={1234}
        thumbnail=""
        category="Sci-Fi"
        onClick={() => console.log('Card clicked')}
      />
      <PromptCard
        id="2"
        title="Fantasy Portrait"
        artist="MagicCreator"
        price={0}
        isFree={true}
        rating={4.9}
        downloads={2456}
        thumbnail=""
        category="Fantasy"
        onClick={() => console.log('Card clicked')}
      />
      <PromptCard
        id="3"
        title="Abstract Dreams"
        artist="ModernMind"
        price={3}
        isFree={false}
        rating={4.6}
        downloads={876}
        thumbnail=""
        category="Abstract"
        onClick={() => console.log('Card clicked')}
      />
    </div>
  );
}
