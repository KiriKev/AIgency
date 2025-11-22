import CreationCard from '../CreationCard';

export default function CreationCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <CreationCard
        id="1"
        creator="ArtLover"
        originalPrompt="Cyberpunk Cityscape"
        likes={234}
        views={1520}
        comments={45}
        iterations={3}
      />
      <CreationCard
        id="2"
        creator="DigitalDreamer"
        originalPrompt="Fantasy Portrait"
        likes={456}
        views={2340}
        comments={67}
        iterations={2}
      />
      <CreationCard
        id="3"
        creator="NeonArtist"
        originalPrompt="Abstract Dreams"
        likes={189}
        views={980}
        comments={23}
        iterations={5}
      />
    </div>
  );
}
