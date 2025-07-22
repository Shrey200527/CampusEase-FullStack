# CampusEase 🎓✨

CampusEase is a full-stack event planning and vendor management web platform designed for college students. It bridges the gap between student event organizers and local service/product providers for rentals and purchases.

## 🔧 Tech Stack
- **Frontend**: HTML, CSS, Bootstrap, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON-based listings storage
- **Others**: Multer (image uploads), LocalStorage (cart)

## 🎯 Features
- Category-based listings: Furniture, Decor, Printables, Transport
- Real-time item listing and updates
- Smart filters (price, delivery time)
- Live keyword search with suggestions
- Add to cart with quantity & rent duration
- Checkout with cost calculation
- Dynamic rendering and cart management

## 📁 Project Structure
- `public/`: Frontend assets
- `server.js`: Express backend
- `listings.json`: Persistent product data
- `uploads/`: Uploaded product images

## 🚀 Getting Started

```bash
npm install
node server.js
