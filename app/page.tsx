import Image from 'next/image'
import Link from 'next/link'
import VerticalVideoPlayer from '@/components/VideoPlayer'
//https://youtube.com/shorts/CL1ijLytk2I?feature=share
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Rafiki&apos;s Kitchen</h1>
        <p className="text-xl mb-6">Artisanal sandwiches crafted with love and care.</p>
        <Link href="/menu" className="bg-stone-800 text-white px-6 py-3 rounded-md inline-block hover:bg-stone-700 transition-colors">
          View Our Menu
        </Link>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-4 md:mb-0 md:pr-4">
            <Image src="/placeholder.svg" alt="Rafiki's Kitchen" width={500} height={300} className="rounded-lg" />
          </div>
          <div className="md:w-1/2">
            <p className="mb-4">
              Rafiki&apos;s Kitchen was born out of a passion for creating the perfect sandwich. Our artisanal approach combines fresh, locally-sourced ingredients with innovative flavor combinations.
            </p>
            <p>
              Every sandwich is crafted with care, ensuring a delightful experience with every bite.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Featured Sandwiches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src="/placeholder.svg" alt={`Sandwich ${item}`} width={400} height={300} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Delicious Sandwich {item}</h3>
                <p className="text-stone-600 mb-4">A mouthwatering combination of flavors...</p>
                <Link href="/menu" className="text-stone-800 font-medium hover:underline">
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 p-4 bg-yellow-100 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Customers will need to book a delivery service to pick up their order at the selected slot.
        </p>
      </div> */}
      <VerticalVideoPlayer src="CL1ijLytk2I" isYouTube />
      {/* <VerticalVideoPlayer src="/RafikiLaunch_Final.MOV" /> */}
    </div>
  )
}