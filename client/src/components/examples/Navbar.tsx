import Navbar from '../Navbar';

export default function NavbarExample() {
  return <Navbar credits={125} username="Artist" onSearch={(q) => console.log('Search:', q)} />;
}
