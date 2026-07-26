# Ventura — Camping & Outdoor Gear

A premium camping e-commerce storefront inspired by modern outdoor retail UI.

**Live:** [https://ventura-gfdg3.vercel.app](https://ventura-gfdg3.vercel.app)

Built with **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **Framer Motion**.

## Screenshots

### Home
![Home page](docs/screenshots/home.png)

### Shop
![Products catalog](docs/screenshots/products-full.png)

### Shop filters & sort
![Shop filters sidebar and sort menu](docs/screenshots/shop-filters.png)

### Product detail
![Product detail page](docs/screenshots/product-detail.png)

### Add to cart
![Product page after adding to cart](docs/screenshots/add-to-cart.png)

### Cart
![Shopping cart with product](docs/screenshots/cart.png)

### Checkout — address & payment
![Checkout with shipping address and payment](docs/screenshots/checkout-full.png)

### Wishlist
![Wishlist page](docs/screenshots/wishlist.png)

### About
![About page](docs/screenshots/about.png)

### Contact
![Contact page](docs/screenshots/contact.png)

### FAQ
![FAQ page](docs/screenshots/faq.png)

### Shipping
![Shipping page](docs/screenshots/shipping.png)

## Features

- Landing page with hero, categories, deals countdown, brand showcase
- Product catalog with search and filters
- Product detail with colorways, cart, and checkout
- Guest cart, wishlist, and orders stored in the database
- Contact form with message persistence

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
