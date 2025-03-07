export default function Footer() {
  //get the current year
  const year = new Date().getFullYear()
  return (
    <footer className="bg-black text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {year} Rafiki&apos;s Kitchen. All rights reserved.</p>
      </div>
    </footer>
  )
}