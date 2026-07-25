# Ventura — Camping & Outdoor Gear

A premium camping e-commerce storefront inspired by modern outdoor retail UI.

**Live:** [https://ventura-gfdg3.vercel.app](https://ventura-gfdg3.vercel.app)

Built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **Framer Motion**.

## Features

- Landing page with hero, categories, deals countdown, brand showcase
- Product catalog with search and filters
- Product detail with colorway previews, cart, and checkout
- Guest cart, wishlist, and orders stored in the database
- Contact form with message persistence

## Screenshots

### Home

![Home page](docs/screenshots/home.png)

### Shop

![Products catalog](docs/screenshots/products.png)

### Product detail

![Product detail page](docs/screenshots/product-detail.png)

### Cart

![Cart page](docs/screenshots/cart.png)

### Checkout

![Checkout page](docs/screenshots/checkout.png)

### Wishlist

![Wishlist page](docs/screenshots/wishlist.png)

### About

![About page](docs/screenshots/about.png)

### Contact

![Contact page](docs/screenshots/contact.png)

### FAQ

![FAQ page](docs/screenshots/faq.png)

### Shipping & Returns

![Shipping page](docs/screenshots/shipping.png)

## Getting Started

```bash
npm install
npm run prisma:generate
npm run prisma:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command         | Description      |
|-----------------|------------------|
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |
| `npm start`     | Start production |
| `npm run lint`  | Run ESLint       |
| `npm run prisma:seed` | Seed the local database |
