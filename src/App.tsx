import { FormEvent, useEffect, useMemo, useState } from "react";
import { clearStaffSession, customerLogin, customerRegister, staffLogin, type Customer, type User } from "./lib/api";

type PublicRoute = "home" | "branches" | "menu" | "book" | "basket" | "orders" | "login" | "register";
type StaffRoute = "dashboard" | "menu-admin" | "orders-admin" | "inventory" | "users" | "reports";
type Route = PublicRoute | StaffRoute;

type MenuItem = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
};

type CartItem = MenuItem & { quantity: number };

const API_URL = import.meta.env.VITE_API_URL || "https://steakz-final.onrender.com";

const branches = [
  {
    name: "Mayfair Prime Steakhouse",
    slug: "mayfair-prime",
    area: "Mayfair",
    address: "18 Berkeley Street, Mayfair, London W1J 8NF",
    phone: "020 7946 1010",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    description: "Flagship dining room with dry-aged beef, private booths, and polished Mayfair service.",
  },
  {
    name: "Soho Flame Grill",
    slug: "soho-flame",
    area: "Soho",
    address: "42 Greek Street, Soho, London W1D 4EE",
    phone: "020 7946 2020",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
    description: "Lively grill house with open flames, late tables, premium steaks, and mocktail service.",
  },
  {
    name: "Kensington Steak Room",
    slug: "kensington-steak-room",
    area: "Kensington",
    address: "77 Kensington High Street, London W8 5NP",
    phone: "020 7946 3030",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    description: "Elegant neighbourhood steak room for family dining, quiet celebrations, and classic service.",
  },
  {
    name: "Canary Wharf Grill House",
    slug: "canary-wharf-grill-house",
    area: "Canary Wharf",
    address: "9 Westferry Circus, Canary Wharf, London E14 4HD",
    phone: "020 7946 4040",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    description: "Riverside grill house for business lunches, fast service, premium cuts, and evening dining.",
  },
  {
    name: "Covent Garden Steakhouse",
    slug: "covent-garden-steakhouse",
    area: "Covent Garden",
    address: "24 Henrietta Street, Covent Garden, London WC2E 8ND",
    phone: "020 7946 5050",
    imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    description: "Theatre district steakhouse with generous sides, desserts, and polished table service.",
  },
];

const menuItems: MenuItem[] = [
  menu(1, "Starters", "Burrata & Charred Tomato", "Creamy burrata with coal-roasted tomatoes, basil oil, aged balsamic, and toasted seeds.", 11.95, "burrata-charred-tomato"),
  menu(2, "Starters", "Crispy Calamari", "Lightly fried calamari with lemon aioli, chilli salt, parsley, and fresh lemon.", 10.95, "crispy-calamari"),
  menu(3, "Starters", "Garlic Butter Prawns", "King prawns in garlic parsley butter with lemon, toasted sourdough, chilli, and dressed leaves.", 13.5, "garlic-butter-prawns"),
  menu(4, "Starters", "Smoked Bone Marrow Toast", "Roasted bone marrow with parsley salad, sourdough toast, pickled shallots, and sea salt.", 12.25, "smoked-bone-marrow-toast"),
  menu(5, "Premium Steaks", "Dry-Aged Ribeye Steak", "300g dry-aged ribeye with rosemary butter, peppercorn sauce, triple-cooked chips, and vine tomatoes.", 34.95, "dry-aged-ribeye-steak"),
  menu(6, "Premium Steaks", "Prime Fillet Mignon", "Centre-cut fillet with dauphinoise potatoes, roasted shallots, tenderstem broccoli, and red wine jus.", 39.5, "prime-fillet-mignon"),
  menu(7, "Premium Steaks", "T-Bone Flame Cut", "Flame-grilled T-bone with smoked sea salt, grilled onions, house fries, and classic bearnaise.", 41.5, "t-bone-flame-cut"),
  menu(8, "Premium Steaks", "Surf and Turf Fillet", "Fillet steak with garlic prawns, lobster butter, skinny fries, asparagus, and lemon.", 48.5, "surf-and-turf-fillet"),
  menu(9, "Premium Steaks", "Chargrilled Sirloin", "280g sirloin with skin-on fries, asparagus, charred mushrooms, rocket salad, and steak glaze.", 29.75, "chargrilled-sirloin"),
  menu(10, "Premium Steaks", "Porterhouse for One", "Large porterhouse grilled on the bone with roasted garlic, beef dripping chips, and bone marrow jus.", 42.95, "porterhouse-for-one"),
  menu(11, "Premium Steaks", "Wagyu Rump Cap", "Rich rump cap with chimichurri, crispy potatoes, roasted peppers, and watercress.", 45, "wagyu-rump-cap"),
  menu(12, "Premium Steaks", "Black Pepper Striploin", "New York striploin crusted with black pepper, mash, greens, and brandy peppercorn sauce.", 32.95, "black-pepper-striploin"),
  menu(13, "Burgers", "Steakz House Burger", "Double beef patty, smoked cheddar, pickles, house sauce, brioche bun, fries, and coleslaw.", 16.95, "steakz-house-burger"),
  menu(14, "Burgers", "Truffle Steak Burger", "Steak mince patty with truffle mayo, gruyere, rocket, caramelised onion, and fries.", 18.95, "truffle-steak-burger"),
  menu(15, "Sides", "Beef Dripping Chips", "Triple-cooked chips finished in beef dripping with smoked salt and roasted garlic aioli.", 5.95, "beef-dripping-chips"),
  menu(16, "Sides", "Truffle Mac and Cheese", "Creamy macaroni with mature cheddar, truffle oil, crisp crumbs, and chives.", 7.95, "truffle-mac-and-cheese"),
  menu(17, "Desserts", "New York Cheesecake", "Vanilla cheesecake with biscuit base, berry compote, fresh strawberries, cream, and mint.", 8.75, "new-york-cheesecake"),
  menu(18, "Desserts", "Chocolate Fondant", "Dark chocolate fondant with vanilla ice cream, cocoa nibs, and espresso caramel.", 9.5, "chocolate-fondant"),
  menu(19, "Soft Drinks", "Classic Cola", "Ice-cold cola served with lime.", 3.95, "classic-cola"),
  menu(20, "Mocktails", "Nojito", "Mint, lime, sugar, soda, and crushed ice.", 6.95, "nojito"),
];

const categoryOrder = ["Starters", "Premium Steaks", "Burgers", "Sides", "Desserts", "Soft Drinks", "Mocktails"];

function menu(id: number, category: string, name: string, description: string, price: number, imageName: string): MenuItem {
  return {
    id,
    category,
    name,
    description,
    price,
    imageUrl: `${API_URL}/images/menu/${imageName}.jpg`,
    available: true,
  };
}

function routeFromPath(pathname: string): Route {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname === "/branches" || pathname.startsWith("/branches/")) return "branches";
  if (pathname === "/customer-menu") return "menu";
  if (pathname === "/reservations" || pathname === "/book") return "book";
  if (pathname === "/basket") return "basket";
  if (pathname === "/orders") return "orders";
  if (pathname === "/login" || pathname === "/admin-login") return "login";
  if (pathname === "/register") return "register";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/menu") return "menu-admin";
  if (pathname === "/inventory") return "inventory";
  if (pathname === "/users") return "users";
  if (pathname === "/reports") return "reports";
  return "home";
}

function pathForRoute(route: Route) {
  const paths: Record<Route, string> = {
    home: "/home",
    branches: "/branches",
    menu: "/customer-menu",
    book: "/reservations",
    basket: "/basket",
    orders: "/orders",
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    "menu-admin": "/menu",
    "orders-admin": "/orders",
    inventory: "/inventory",
    users: "/users",
    reports: "/reports",
  };
  return paths[route];
}

function stored<T>(key: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null") as T | null;
  } catch {
    return null;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));
  const [customer, setCustomer] = useState<Customer | null>(() => stored<Customer>("steakz_customer_user"));
  const [staffUser, setStaffUser] = useState<User | null>(() => stored<User>("steakz_staff_user"));
  const [selectedBranch, setSelectedBranch] = useState(branches[0].name);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/home");
      setRoute("home");
    }
    const onPop = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const basketTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function navigate(nextRoute: Route) {
    window.history.pushState({}, "", pathForRoute(nextRoute));
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToBasket(item: MenuItem, quantity: number) {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      }
      return [...current, { ...item, quantity }];
    });
    setFlash(`${item.name} added to basket.`);
    navigate("basket");
  }

  function customerLoggedIn(nextCustomer: Customer) {
    sessionStorage.setItem("steakz_customer_user", JSON.stringify(nextCustomer));
    setCustomer(nextCustomer);
    setFlash("Customer login successful.");
    navigate("home");
  }

  function logout() {
    clearStaffSession();
    sessionStorage.removeItem("steakz_customer_user");
    setCustomer(null);
    setStaffUser(null);
    setFlash("");
    navigate("home");
  }

  const currentUser = staffUser ?? customer;
  const publicRoute = route === "menu-admin" ? "menu" : route === "orders-admin" ? "orders" : route;

  if (staffUser && ["dashboard", "menu-admin", "orders-admin", "inventory", "users", "reports"].includes(route)) {
    return (
      <StaffLayout user={staffUser} activeRoute={route} navigate={navigate} logout={logout}>
        {route === "dashboard" && <DashboardPage user={staffUser} />}
        {route === "menu-admin" && <AdminTable title="Menu Items" intro="Manage the Steakz menu and availability." />}
        {route === "orders-admin" && <AdminTable title="Orders / Sales" intro="View branch orders and kitchen progress." />}
        {route === "inventory" && <AdminTable title="Inventory" intro="Monitor stock, low levels, and availability." />}
        {route === "users" && <AdminTable title="Staff / Users" intro="Manage seeded staff and branch access." />}
        {route === "reports" && <ReportsPage />}
      </StaffLayout>
    );
  }

  if (route === "login") {
    return (
      <LoginPage
        onCustomerLogin={customerLoggedIn}
        onStaffLogin={(user) => {
          setStaffUser(user);
          navigate("dashboard");
        }}
        navigate={navigate}
      />
    );
  }

  if (route === "register") {
    return <RegisterPage onCustomerLogin={customerLoggedIn} navigate={navigate} />;
  }

  return (
    <>
      {flash && <div className="message success floating-message">{flash}</div>}
      {publicRoute === "home" && <HomePage basketCount={cart.length} currentUser={currentUser} navigate={navigate} />}
      {publicRoute === "branches" && (
        <BranchesPage
          basketCount={cart.length}
          currentUser={currentUser}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          navigate={navigate}
        />
      )}
      {publicRoute === "menu" && (
        <MenuPage
          basketCount={cart.length}
          currentUser={currentUser}
          selectedBranch={selectedBranch}
          navigate={navigate}
          addToBasket={addToBasket}
        />
      )}
      {publicRoute === "basket" && (
        <BasketPage
          basketCount={cart.length}
          currentUser={currentUser}
          selectedBranch={selectedBranch}
          cart={cart}
          setCart={setCart}
          navigate={navigate}
          submitOrder={() => {
            if (!customer) {
              setFlash("Please login before submitting an order.");
              navigate("login");
              return;
            }
            setCart([]);
            setFlash("Order submitted successfully.");
            navigate("orders");
          }}
        />
      )}
      {publicRoute === "book" && (
        <ReservationsPage basketCount={cart.length} currentUser={currentUser} selectedBranch={selectedBranch} navigate={navigate} />
      )}
      {publicRoute === "orders" && <OrdersPage basketCount={cart.length} currentUser={currentUser} navigate={navigate} />}
    </>
  );
}

function PublicNav({
  basketCount,
  currentUser,
  navigate,
  className = "lux-nav",
}: {
  basketCount: number;
  currentUser: User | Customer | null;
  navigate: (route: Route) => void;
  className?: string;
}) {
  return (
    <header className={className}>
      <a
        className="brand-home"
        href={pathForRoute("home")}
        onClick={(event) => {
          event.preventDefault();
          navigate("home");
        }}
      >
        <span className="brand-mark-small">S</span>
        <span>
          <strong>Steakz</strong>
          <small>London Steakhouse</small>
        </span>
      </a>
      <nav>
        {(["home", "branches", "menu", "book", "basket"] as Route[]).map((routeName) => (
          <a
            key={routeName}
            href={pathForRoute(routeName)}
            onClick={(event) => {
              event.preventDefault();
              navigate(routeName);
            }}
          >
            {routeName === "book" ? "Book" : routeName === "basket" ? `Basket ${basketCount ? `(${basketCount})` : ""}` : routeName[0].toUpperCase() + routeName.slice(1)}
          </a>
        ))}
        <a
          href={pathForRoute(currentUser ? "dashboard" : "login")}
          onClick={(event) => {
            event.preventDefault();
            navigate(currentUser ? "dashboard" : "login");
          }}
        >
          {currentUser ? "Dashboard" : "Login"}
        </a>
      </nav>
    </header>
  );
}

function HomePage({ basketCount, currentUser, navigate }: { basketCount: number; currentUser: User | Customer | null; navigate: (route: Route) => void }) {
  const featured = menuItems.filter((item) => item.category === "Premium Steaks").slice(0, 4);

  return (
    <div className="site-shell">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} />
      <main className="restaurant-hero">
        <div className="restaurant-hero-overlay">
          <span className="eyebrow">Dry-aged in London</span>
          <h1>Premium Steaks in London</h1>
          <p>Dry-aged British beef, fire-led cooking, polished hospitality, and candlelit dining rooms across the capital.</p>
          <div className="home-actions">
            <button className="button-link" onClick={() => navigate("book")}>Book a Table</button>
            <button className="secondary-link" onClick={() => navigate("branches")}>Order Online</button>
          </div>
        </div>
      </main>

      <section className="lux-section">
        <div className="section-heading">
          <span className="eyebrow">Signature plates</span>
          <h2>Featured Dishes</h2>
        </div>
        <div className="lux-card-grid">
          {featured.map((dish) => <MenuCard key={dish.id} dish={dish} />)}
        </div>
      </section>

      <section className="lux-section dark-band">
        <div className="section-heading">
          <span className="eyebrow">London dining rooms</span>
          <h2>Branches</h2>
        </div>
        <div className="branch-preview-grid">
          {branches.slice(0, 3).map((branch) => (
            <a
              className="branch-preview-card"
              key={branch.slug}
              href={`/branches/${branch.slug}`}
              onClick={(event) => {
                event.preventDefault();
                navigate("branches");
              }}
            >
              <img src={branch.imageUrl} alt={branch.name} />
              <span>{branch.area}</span>
              <strong>{branch.name}</strong>
              <small>{branch.address}</small>
            </a>
          ))}
        </div>
        <button className="button-link" onClick={() => navigate("branches")}>View All Branches</button>
      </section>

      <section className="lux-section">
        <div className="section-heading">
          <span className="eyebrow">Guest notes</span>
          <h2>Customer Reviews</h2>
        </div>
        <div className="review-grid">
          <article className="review-card"><p>“The ribeye was perfectly rested, the room felt elegant, and service moved with real confidence.”</p><strong>Amira L.</strong></article>
          <article className="review-card"><p>“A proper London steakhouse. Gorgeous sides, beautiful cocktails, and a kitchen that knows beef.”</p><strong>James W.</strong></article>
          <article className="review-card"><p>“Mayfair Prime feels special from the first welcome. The fillet and bearnaise were faultless.”</p><strong>Priya S.</strong></article>
        </div>
      </section>

      <section className="lux-section hours-section">
        <div className="section-heading">
          <span className="eyebrow">Open daily</span>
          <h2>Opening Hours</h2>
        </div>
        <div className="hours-grid">
          <div><strong>Monday to Thursday</strong><span>12:00 - 23:00</span></div>
          <div><strong>Friday to Saturday</strong><span>12:00 - 00:30</span></div>
          <div><strong>Sunday</strong><span>12:00 - 22:00</span></div>
        </div>
      </section>

      <footer className="lux-footer">
        <strong>Steakz London</strong>
        <span>18 Berkeley Street, Mayfair, London W1J 8NF</span>
        <span>reservations@steakz.com · 020 7946 1010</span>
        <span>Dry-aged steaks, private dining, online ordering, and branch-managed hospitality.</span>
      </footer>
    </div>
  );
}

function MenuCard({ dish }: { dish: MenuItem }) {
  return (
    <article className="menu-card lux-card">
      <div className="menu-card-image">
        <img src={dish.imageUrl} alt={dish.name} />
        <span className="menu-tag">{dish.category}</span>
      </div>
      <div className="menu-card-body">
        <div className="menu-card-heading">
          <div>
            <span className="menu-category">{dish.category}</span>
            <h3>{dish.name}</h3>
          </div>
          <strong>£{dish.price.toFixed(2)}</strong>
        </div>
        <p>{dish.description}</p>
      </div>
    </article>
  );
}

function MenuPage({
  basketCount,
  currentUser,
  selectedBranch,
  navigate,
  addToBasket,
}: {
  basketCount: number;
  currentUser: User | Customer | null;
  selectedBranch: string;
  navigate: (route: Route) => void;
  addToBasket: (item: MenuItem, quantity: number) => void;
}) {
  return (
    <div className="customer-menu-page">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} className="customer-menu-nav" />
      <main className="customer-menu-hero">
        <div className="customer-menu-copy">
          <span className="eyebrow">Customer ordering</span>
          <h1>Premium Steakhouse Menu</h1>
          <p>Order from {selectedBranch}. Add plates, drinks, desserts, and sides to your basket before submitting to the branch kitchen.</p>
          <button className="button-link" onClick={() => navigate("basket")}>View Basket</button>
        </div>
        <div className="customer-menu-photo">
          <img src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80" alt="Chargrilled steak served with sides" />
        </div>
      </main>

      {categoryOrder.map((category) => {
        const items = menuItems.filter((item) => item.category === category);
        if (!items.length) return null;
        return (
          <section className="customer-menu-section" key={category}>
            <div className="customer-menu-intro">
              <span>{category}</span>
              <h2>{category}</h2>
            </div>
            <div className="customer-dish-grid">
              {items.map((dish) => <DishCard key={dish.id} dish={dish} addToBasket={addToBasket} />)}
            </div>
          </section>
        );
      })}

      <section className="customer-menu-cta">
        <div>
          <span>Branch ordering</span>
          <h2>Each order is sent only to the selected London branch.</h2>
        </div>
        <p>Managers, chefs, and waiters see their own branch orders, while head office can review everything.</p>
        <button className="button-link" onClick={() => navigate("branches")}>Change Branch</button>
      </section>
    </div>
  );
}

function DishCard({ dish, addToBasket }: { dish: MenuItem; addToBasket: (item: MenuItem, quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <article className="customer-dish-card">
      <div className="customer-dish-image">
        <img src={dish.imageUrl} alt={dish.name} />
        <span>{dish.category}</span>
      </div>
      <div className="customer-dish-body">
        <div className="customer-dish-heading">
          <div>
            <h3>{dish.name}</h3>
            <p>{dish.description}</p>
          </div>
          <strong>£{dish.price.toFixed(2)}</strong>
        </div>
        <div className="add-to-basket-form">
          <label>Quantity</label>
          <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} />
          <button type="button" onClick={() => addToBasket(dish, quantity)}>Add to Basket</button>
        </div>
      </div>
    </article>
  );
}

function BranchesPage({
  basketCount,
  currentUser,
  selectedBranch,
  setSelectedBranch,
  navigate,
}: {
  basketCount: number;
  currentUser: User | Customer | null;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  navigate: (route: Route) => void;
}) {
  return (
    <div className="site-shell">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} />
      <section className="lux-section">
        <div className="section-heading">
          <span className="eyebrow">London branches</span>
          <h2>Choose Your Steakz Branch</h2>
          <p className="page-intro">Selected: {selectedBranch}</p>
        </div>
        <div className="branch-preview-grid">
          {branches.map((branch) => (
            <a
              className="branch-preview-card"
              key={branch.slug}
              href={`/branches/${branch.slug}`}
              onClick={(event) => {
                event.preventDefault();
                setSelectedBranch(branch.name);
                navigate("menu");
              }}
            >
              <img src={branch.imageUrl} alt={branch.name} />
              <span>{branch.area}</span>
              <strong>{branch.name}</strong>
              <small>{branch.address}</small>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function BasketPage({
  basketCount,
  currentUser,
  selectedBranch,
  cart,
  setCart,
  navigate,
  submitOrder,
}: {
  basketCount: number;
  currentUser: User | Customer | null;
  selectedBranch: string;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  navigate: (route: Route) => void;
  submitOrder: () => void;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const service = subtotal * 0.125;
  const vat = subtotal * 0.2;
  const total = subtotal + service + vat;

  return (
    <div className="basket-page">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} />
      <section className="basket-hero">
        <div className="basket-hero-copy">
          <span className="eyebrow">Customer basket</span>
          <h1>Your Basket</h1>
          <p className="page-intro">Branch: {selectedBranch}. Your order will be visible only to this branch team after submission.</p>
        </div>
        <div className="basket-summary-card">
          <span>Final total</span>
          <strong>£{total.toFixed(2)}</strong>
          <button className="secondary-link" onClick={() => navigate("menu")}>Continue Ordering</button>
        </div>
      </section>

      {cart.length ? (
        <>
          <section className="basket-list">
            {cart.map((item) => (
              <article className="basket-item" key={item.id}>
                <img src={item.imageUrl} alt={item.name} />
                <div className="basket-item-main">
                  <span>{item.category}</span>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                </div>
                <div className="basket-item-numbers">
                  <dl>
                    <dt>Quantity</dt>
                    <dd>
                      <div className="qty-controls">
                        <button className="small" onClick={() => setCart((items) => items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) } : cartItem))}>-</button>
                        <span>{item.quantity}</span>
                        <button className="small" onClick={() => setCart((items) => items.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem))}>+</button>
                      </div>
                    </dd>
                    <dt>Price</dt>
                    <dd>£{item.price.toFixed(2)}</dd>
                    <dt>Subtotal</dt>
                    <dd>£{(item.price * item.quantity).toFixed(2)}</dd>
                  </dl>
                  <button className="danger" onClick={() => setCart((items) => items.filter((cartItem) => cartItem.id !== item.id))}>Remove</button>
                </div>
              </article>
            ))}
          </section>
          <section className="basket-checkout">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-line"><span>Subtotal</span><strong>£{subtotal.toFixed(2)}</strong></div>
              <div className="summary-line"><span>Service charge</span><strong>£{service.toFixed(2)}</strong></div>
              <div className="summary-line"><span>VAT</span><strong>£{vat.toFixed(2)}</strong></div>
              <div className="summary-line final"><span>Final total</span><strong>£{total.toFixed(2)}</strong></div>
            </div>
            <button onClick={submitOrder}>Submit Order</button>
            <button className="secondary-link" onClick={() => navigate("menu")}>Back to Menu</button>
          </section>
        </>
      ) : (
        <section className="empty-basket">
          <h2>Your basket is empty.</h2>
          <p>Add steak plates, drinks, desserts, or sides from the menu.</p>
          <button className="button-link" onClick={() => navigate("menu")}>Go to Menu</button>
        </section>
      )}
    </div>
  );
}

function ReservationsPage({ basketCount, currentUser, selectedBranch, navigate }: { basketCount: number; currentUser: User | Customer | null; selectedBranch: string; navigate: (route: Route) => void }) {
  return (
    <div className="basket-page">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} />
      <section className="basket-hero">
        <div className="basket-hero-copy">
          <span className="eyebrow">Steakz reservations</span>
          <h1>Book a Table</h1>
          <p className="page-intro">Reserve your table at one of our London dining rooms. Your booking is private to your account and assigned branch.</p>
        </div>
      </section>
      <section className="panel booking-panel">
        <h2>New Booking</h2>
        <form className="booking-form" onSubmit={(event) => event.preventDefault()}>
          <label>Branch<select defaultValue={selectedBranch}>{branches.map((branch) => <option key={branch.slug}>{branch.name}</option>)}</select></label>
          <label>Date<input type="date" required /></label>
          <label>Time<input type="time" required /></label>
          <label>Guests<input type="number" min="1" defaultValue="2" required /></label>
          <label>Customer Name<input placeholder="Customer name" required /></label>
          <label>Phone<input placeholder="Phone number" required /></label>
          <label>Notes<textarea rows={4} placeholder="Occasion, seating request, allergies" /></label>
          <button type="submit">Confirm Booking</button>
        </form>
      </section>
    </div>
  );
}

function OrdersPage({ basketCount, currentUser, navigate }: { basketCount: number; currentUser: User | Customer | null; navigate: (route: Route) => void }) {
  return (
    <div className="basket-page">
      <PublicNav basketCount={basketCount} currentUser={currentUser} navigate={navigate} />
      <section className="empty-basket">
        <h2>My Orders</h2>
        <p>Submitted customer orders will appear here after checkout.</p>
        <button className="button-link" onClick={() => navigate("menu")}>Order Again</button>
      </section>
    </div>
  );
}

function LoginPage({
  onCustomerLogin,
  onStaffLogin,
  navigate,
}: {
  onCustomerLogin: (customer: Customer) => void;
  onStaffLogin: (user: User) => void;
  navigate: (route: Route) => void;
}) {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    try {
      const staff = await staffLogin(email, password);
      if (staff) {
        onStaffLogin(staff);
        return;
      }

      const customerUser = await customerLogin(email, password);
      if (customerUser) {
        onCustomerLogin(customerUser);
        return;
      }

      setMessage("Invalid email or password.");
    } catch {
      setMessage("Login failed. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <button className="back-home-link" onClick={() => navigate("home")}>Back to Home</button>
      <section className="login-card">
        <h1>Steakz MIS Portal</h1>
        <p>Professional Management Information System for the Steakz restaurant chain.</p>
        <form onSubmit={submit}>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          {message && <div className="message error">{message}</div>}
          <button type="submit">Login</button>
        </form>
        <div className="sample">
          <p>New customer?</p>
          <button className="secondary-link" onClick={() => navigate("register")}>Create Customer Account</button>
        </div>
      </section>
    </main>
  );
}

function RegisterPage({
  onCustomerLogin,
  navigate,
}: {
  onCustomerLogin: (customer: Customer) => void;
  navigate: (route: Route) => void;
}) {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const customer = await customerRegister({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: "",
        password: String(data.get("password") || ""),
        branch: String(data.get("branch") || branches[0].name),
      });
      onCustomerLogin(customer);
    } catch {
      setMessage("Could not create account. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <button className="back-home-link" onClick={() => navigate("home")}>Back to Home</button>
      <section className="login-card">
        <h1>Create Account</h1>
        <p>Create a customer account before making a reservation.</p>
        <form onSubmit={submit}>
          <label>Full Name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          <label>
            Preferred London Branch
            <select name="branch" required defaultValue={branches[0].name}>
              {branches.map((branch) => <option key={branch.slug}>{branch.name}</option>)}
            </select>
          </label>
          {message && <div className="message error">{message}</div>}
          <button type="submit">Create Account</button>
        </form>
        <div className="sample">
          <p>Already have an account?</p>
          <button className="secondary-link" onClick={() => navigate("login")}>Login</button>
        </div>
      </section>
    </main>
  );
}

function StaffLayout({ user, activeRoute, navigate, logout, children }: { user: User; activeRoute: Route; navigate: (route: Route) => void; logout: () => void; children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Steakz MIS</h2>
        <p className="small">{user.role.replace("_", " ").toUpperCase()} {user.branch ? `- ${user.branch}` : ""}</p>
        <nav>
          <button onClick={() => navigate("home")}>Home</button>
          <button className={activeRoute === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>Dashboard</button>
          <button className={activeRoute === "menu-admin" ? "active" : ""} onClick={() => navigate("menu-admin")}>Menu Items</button>
          <button className={activeRoute === "orders-admin" ? "active" : ""} onClick={() => navigate("orders-admin")}>Orders / Sales</button>
          <button className={activeRoute === "inventory" ? "active" : ""} onClick={() => navigate("inventory")}>Inventory</button>
          <button className={activeRoute === "users" ? "active" : ""} onClick={() => navigate("users")}>Staff / Users</button>
          <button className={activeRoute === "reports" ? "active" : ""} onClick={() => navigate("reports")}>Reports</button>
        </nav>
        <button className="logout" onClick={logout}>Logout</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

function DashboardPage({ user }: { user: User }) {
  return (
    <section className="dashboard-page">
      <section className="dashboard-hero">
        <span className="eyebrow">Steakz MIS</span>
        <h1>{user.role.replace("_", " ").toUpperCase()} Dashboard</h1>
        <p>Premium branch management, order tracking, reservations, stock, users, and reports.</p>
      </section>
      <div className="dashboard-grid">
        <article><span>Total Sales</span><strong>£346.09</strong></article>
        <article><span>Orders</span><strong>6</strong></article>
        <article><span>Reservations</span><strong>1</strong></article>
        <article><span>Menu Items</span><strong>{menuItems.length}</strong></article>
      </div>
    </section>
  );
}

function AdminTable({ title, intro }: { title: string; intro: string }) {
  return (
    <section className="dashboard-page">
      <section className="dashboard-hero">
        <span className="eyebrow">Steakz MIS</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Branch</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            {branches.slice(0, 4).map((branch) => (
              <tr key={branch.slug}><td>{title}</td><td>{branch.name}</td><td>Available</td><td>Today</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}

function ReportsPage() {
  return (
    <section className="dashboard-page">
      <section className="dashboard-hero">
        <span className="eyebrow">Reports</span>
        <h1>Branch Performance</h1>
        <p>Sales, orders, reservations, top dishes, and branch overview.</p>
      </section>
      <div className="dashboard-grid">
        <article><span>Total Sales</span><strong>£346.09</strong></article>
        <article><span>Total Orders</span><strong>6</strong></article>
        <article><span>Low Stock</span><strong>0</strong></article>
        <article><span>Top Dish</span><strong>Ribeye</strong></article>
      </div>
    </section>
  );
}
