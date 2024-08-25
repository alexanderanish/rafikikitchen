import './globals.css'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })
// const anvir = localFont({
//   src:[
//     {
//       path:'./fonts/anvir/AvenirLTStd-Black.otf',
//       weight: '900',
//       style: 'normal',
//     },
//     {
//       path:'./fonts/anvir/AvenirLTStd-BlackOblique.otf',
//       weight: '900',
//       style: 'italic',
//     },
//     {
//       path:'./fonts/anvir/AvenirLTStd-Book.otf',
//       weight: '600',
//       style: 'normal',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-BookOblique.otf',
//       weight: '600',
//       style: 'italic',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-Heavy.otf',
//       weight: '800',
//       style: 'normal',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-HeavyOblique.otf',
//       weight: '800',
//       style: 'italic',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-Light.otf',
//       weight: '300',
//       style: 'normal',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-LightOblique.otf',
//       weight: '300',
//       style: 'italic',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-Medium.otf',
//       weight: '500',
//       style: 'normal',
//     },
//     {
//       path:'@/fonts/anvir/AvenirLTStd-MediumOblique.otf',
//       weight: '500',
//       style: 'italic',
//     },
//     {
//       path:'@fonts/anvir/AvenirLTStd-Oblique.otf',
//       weight: '400',
//       style: 'italic',
//     },

//     {
//       path:'@fonts/anvir/AvenirLTStd-Roman.otf',
//       weight: '400',
//       style: 'normal',
//     }
//   ]
// })


export const metadata = {
  title: "Rafiki's Kitchen",
  description: 'Artisanal sandwiches crafted with love and care',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-stone-50`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
