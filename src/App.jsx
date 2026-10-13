import React,{useEffect,useState} from "react";

const flavours=[
  {id:"vanilla",name:"Vanilla Crunch",tag:"Creamy vanilla. Cookie crunch.",image:"/images/vanilla-crunch.webp",note:"Classic, but upgraded."},
  {id:"guava",name:"Guava Chilli",tag:"Sweet guava. Wild chilli.",image:"/images/guava-chilli.webp",note:"The unexpected one."},
  {id:"belgian",name:"Belgian Chocolate",tag:"Deep chocolate. Zero added sugar.",image:"/images/belgian-chocolate.webp",note:"For serious chocolate people."},
  {id:"blueberry",name:"Blueberry Cheesecake",tag:"Tangy. Creamy. Addictive.",image:"/images/blueberry-cheesecake.webp",note:"Dessert energy, upgraded."},
  {id:"midnight",name:"Midnight Cookies",tag:"Dark cookies. Big crunch.",image:"/images/midnight-cookies.webp",note:"Your 11PM personality."}
];
const PRICE=149;

function loadRazorpay(){
  if(window.Razorpay)return Promise.resolve(true);
  return new Promise(resolve=>{
    const old=document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if(old){old.addEventListener("load",()=>resolve(true),{once:true});old.addEventListener("error",()=>resolve(false),{once:true});return;}
    const s=document.createElement("script");s.src="https://checkout.razorpay.com/v1/checkout.js";s.async=true;
    s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.body.appendChild(s);
  });
}

function ShopPage(){
  const [cart,setCart]=useState([]);
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState(false);
  const flavours=[
    {name:"Vanilla Crunch",image:"/images/vanilla-crunch.webp",desc:"Creamy vanilla + cookie crunch."},
    {name:"Guava Chilli",image:"/images/guava-chilli.webp",desc:"Sweet guava with a chilli kick."},
    {name:"Belgian Chocolate",image:"/images/belgian-chocolate.webp",desc:"Rich Belgian chocolate."},
    {name:"Blueberry Cheesecake",image:"/images/blueberry-cheesecake.webp",desc:"Tangy cheesecake, blueberry loaded."},
    {name:"Midnight Cookies",image:"/images/midnight-cookies.webp",desc:"Dark cookies. Serious crunch."}
  ];
  const add=f=>setCart(x=>{const old=x.find(i=>i.name===f.name);return old?x.map(i=>i.name===f.name?{...i,q:i.q+1}:i):[...x,{...f,q:1}]});
  const total=cart.reduce((s,i)=>s+i.q*149,0);
  return <div className="ecom-shop-page">
    <header className="ecom-nav">
      <a href="/#/shop" className="ecom-wordmark">CHEATCODE<span>™</span></a>
      <nav><a href="#/shop">SHOP</a><a href="#/build">BUILD YOUR BOX</a><a href="#/why">WHY CHEATCODE</a><a href="#/about">ABOUT</a></nav>
      <div className="ecom-actions">
        <button className="ecom-search" onClick={()=>setSearch(!search)} aria-label="Search">⌕</button>
        <button className="ecom-cart" onClick={()=>setOpen(true)}>CART <b>{cart.reduce((s,i)=>s+i.q,0)}</b></button>
      </div>
    </header>
    {search&&<div className="ecom-searchbar"><input autoFocus placeholder="Search flavours..." onChange={e=>setSearch(e.target.value)}/></div>}
    <main>
      <section className="ecom-shop-hero"><span>CHEATCODE / SHOP</span><h1>YOUR<br/><i>CHEAT.</i></h1><p>Premium high-protein ice cream. Made for cravings without the regret.</p></section>
      <section className="ecom-products">
        <div className="ecom-section-title"><span>01 / ALL FLAVOURS</span><h2>Pick your flavour.</h2><p>10g protein · 0 added sugar · high fibre · low carb</p></div>
        <div className="ecom-product-grid">{flavours.map((f,i)=><article className="ecom-product-card" key={f.name}>
          <div className="ecom-product-visual"><span>0{i+1}</span><img src={f.image} alt={f.name}/></div>
          <div className="ecom-product-meta"><div><h3>{f.name}</h3><p>{f.desc}</p></div><strong>₹149</strong></div>
          <button onClick={()=>add(f)}>ADD TO CART <b>+</b></button>
        </article>)}</div>
      </section>
      <section className="ecom-box" id="build"><div><span>02 / BUILD YOUR BOX</span><h2>MAKE YOUR<br/><i>OWN MIX.</i></h2><p>Pick your favourites and build a box that matches your mood.</p></div><a href="#/shop">START BUILDING →</a></section>
      <section className="ecom-why" id="why"><span>03 / WHY CHEATCODE</span><div><h2>ICE CREAM.<br/><i>UPGRADED.</i></h2><p>10g protein. 0 added sugar. High fibre. Low carb. All the fun stays.</p></div></section>
    </main>
    <footer className="ecom-footer" id="about"><div className="ecom-footer-brand">CHEAT<br/>WITHOUT<br/>REGRET.</div><div><b>SHOP</b><a href="#/shop">All flavours</a><a href="#/build">Build your box</a></div><div><b>CHEATCODE</b><a href="#/why">Why CHEATCODE</a><a href="#/about">About</a></div><div><b>HELP</b><a href="#/faq">FAQ</a><a href="mailto:hello@houseofcheatcode.com">Contact</a></div></footer>
    {open&&<div className="ecom-cart-overlay" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><aside className="ecom-cart-drawer"><button onClick={()=>setOpen(false)}>×</button><span>YOUR CART</span><h2>THE CHEAT.</h2>{cart.length?cart.map(i=><div className="ecom-cart-row" key={i.name}><img src={i.image}/><div><b>{i.name}</b><small>₹149 × {i.q}</small><div><button onClick={()=>setCart(x=>x.map(v=>v.name===i.name?{...v,q:Math.max(0,v.q-1)}:v).filter(v=>v.q))}>−</button><button onClick={()=>add(i)}>+</button></div></div><strong>₹{i.q*149}</strong></div>):<p>Your cart is empty.</p>}<div className="ecom-cart-total"><span>TOTAL</span><b>₹{total}</b></div><button className="ecom-checkout" disabled={!cart.length}>CHECKOUT →</button></aside></div>}
  </div>
}

function App(){
  if(window.location.hash.startsWith("#/shop")||window.location.hash.startsWith("#/build")||window.location.hash.startsWith("#/why")||window.location.hash.startsWith("#/about")) return <ShopPage/>;
  const [cart,setCart]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  const [customer,setCustomer]=useState({name:"",phone:"",email:"",address:"",city:"Ahmedabad",state:"Gujarat",pincode:""});
  const total=cart.reduce((s,i)=>s+i.quantity*PRICE,0);
  const count=cart.reduce((s,i)=>s+i.quantity,0);

  function add(item){
    setCart(c=>{
      const found=c.find(x=>x.id===item.id);
      return found?c.map(x=>x.id===item.id?{...x,quantity:x.quantity+1}:x):[...c,{...item,quantity:1}];
    });
    setCartOpen(true);
  }
  function change(id,delta){
    setCart(c=>c.map(x=>x.id===id?{...x,quantity:x.quantity+delta}:x).filter(x=>x.quantity>0));
  }
  function update(e){setCustomer(c=>({...c,[e.target.name]:e.target.value}));}

  async function pay(e){
    e.preventDefault();if(busy||!cart.length)return;
    setBusy(true);setStatus("");
    try{
      if(!/^[0-9]{10}$/.test(customer.phone))throw new Error("Enter a valid 10-digit phone number.");
      if(!/^[0-9]{6}$/.test(customer.pincode))throw new Error("Enter a valid 6-digit pincode.");
      const loaded=await loadRazorpay();if(!loaded)throw new Error("Payment checkout could not load. Please try again.");
      let keyId=import.meta.env.VITE_RAZORPAY_KEY_ID;
      if(!keyId){const r=await fetch("/api/razorpay-config");const d=await r.json().catch(()=>({}));keyId=d.key_id;}
      if(!keyId)throw new Error("Razorpay is not configured.");
      const orderRes=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart.map(x=>({name:x.name,quantity:x.quantity}))})});
      const order=await orderRes.json().catch(()=>({}));
      if(!orderRes.ok||!order.order_id)throw new Error(order.error||"Could not create your order.");
      const rzp=new window.Razorpay({
        key:keyId,amount:order.amount,currency:order.currency,name:"CHEATCODE™",
        description:cart.map(x=>x.name+" × "+x.quantity).join(", "),order_id:order.order_id,
        theme:{color:"#ff1616"},prefill:{name:customer.name,email:customer.email,contact:customer.phone},
        notes:{order_number:order.order_number},
        handler:async response=>{
          try{
            const vr=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(response)});
            const result=await vr.json().catch(()=>({}));
            if(!vr.ok||!result.verified)throw new Error(result.error||"Payment verification failed.");
            setStatus("ORDER CONFIRMED · #"+order.order_number);
            setCart([]);setCheckoutOpen(false);setCartOpen(false);
          }catch(err){setStatus(err.message||"Payment verification failed.");}
          finally{setBusy(false);}
        },
        modal:{ondismiss:()=>{setBusy(false);setStatus("PAYMENT CANCELLED.");}}
      });
      rzp.on("payment.failed",r=>{setBusy(false);setStatus(r?.error?.description||"Payment failed. Please try again.");});
      rzp.open();
    }catch(err){setBusy(false);setStatus(err.message||"Something went wrong.");}
  }

  if(window.location.pathname==="/lab-report")return <main className="lab-report-page"><div className="lab-report-card"><span className="eyebrow redtext">CHEATCODE™ / LAB REPORT</span><h1>LAB REPORT</h1><p>Your CHEATCODE lab report will appear here.</p></div></main>;

  return <div className="store">
    <header className="store-header">
      <a className="store-logo" href="#top">CHEATCODE<span>™</span></a>
      <nav><a href="#shop">SHOP</a><a href="#why">WHY CHEATCODE</a><a href="#story">OUR STORY</a></nav>
      <button className="store-cart" onClick={()=>setCartOpen(true)}>CART <b>{count}</b></button>
    </header>

    <main id="top">
      <section className="store-hero">
        <div className="store-hero-copy">
          <span className="store-kicker">PREMIUM HIGH-PROTEIN ICE CREAM / AHMEDABAD</span>
          <h1>CHEAT.<br/><i>WITHOUT</i><br/>REGRET.</h1>
          <p>10g protein. 0 added sugar. Low carb. High fibre.<br/>Now delivering across Ahmedabad.</p>
          <a href="#shop" className="store-primary">SHOP THE CHEAT <span>↓</span></a>
          <div className="store-proof"><span><b>10g</b>PROTEIN</span><span><b>0</b>ADDED SUGAR</span><span><b>5</b>FLAVOURS</span></div>
        </div>
        <div className="store-hero-art"><div className="hero-orbit"></div><img src={flavours[2].image} alt="CHEATCODE Belgian Chocolate ice cream" /><div className="hero-badge">₹149<br/><small>125 ML</small></div></div>
      </section>

      <section className="store-marquee"><div>CHEAT WITHOUT REGRET&nbsp; · &nbsp;10g PROTEIN&nbsp; · &nbsp;0 ADDED SUGAR&nbsp; · &nbsp;HIGH FIBRE&nbsp; · &nbsp;LOW CARB&nbsp; · &nbsp;</div><div aria-hidden="true">CHEAT WITHOUT REGRET&nbsp; · &nbsp;10g PROTEIN&nbsp; · &nbsp;0 ADDED SUGAR&nbsp; · &nbsp;HIGH FIBRE&nbsp; · &nbsp;LOW CARB&nbsp; · &nbsp;</div></section>

      <section className="store-shop" id="shop">
        <div className="store-section-head"><div><span className="store-kicker">01 / SHOP</span><h2>Pick your<br/><i>cheat.</i></h2></div><p>Every tub is ₹149.<br/>Choose your flavour. We'll handle the rest.</p></div>
        <div className="product-grid">{flavours.map((f,i)=><article className="product-card" key={f.id}>
          <div className="product-image"><span className="product-number">0{i+1}</span><img src={f.image} alt={f.name+" CHEATCODE ice cream"} /></div>
          <div className="product-info"><div><h3>{f.name}</h3><p>{f.tag}</p></div><strong>₹{PRICE}</strong></div>
          <button className="add-btn" onClick={()=>add(f)}>ADD TO CART <span>+</span></button>
        </article>)}</div>
      </section>

      <section className="store-benefits" id="why">
        <div><span>01</span><b>10g</b><small>PROTEIN / TUB</small></div>
        <div><span>02</span><b>0g</b><small>ADDED SUGAR</small></div>
        <div><span>03</span><b>HIGH</b><small>FIBRE</small></div>
        <div><span>04</span><b>LOW</b><small>CARB</small></div>
      </section>

      <section className="store-story" id="story">
        <div className="story-image"><img src="/images/Cheatcode Section 3.JPG" alt="CHEATCODE brand" /></div>
        <div className="story-copy"><span className="store-kicker">02 / WHY CHEATCODE</span><h2>ICE CREAM<br/><i>grew up.</i></h2><p>We kept the part you crave and rethought the part you don't. CHEATCODE is indulgence with a better cheat sheet — made for people who refuse to choose between pleasure and better choices.</p><a href="#shop" className="store-text-link">SHOP ALL FLAVOURS →</a></div>
      </section>

      <section className="store-bottom">
        <span className="store-kicker">03 / YOUR NEXT CRAVING</span><h2>GO AHEAD.<br/><i>CHEAT.</i></h2><button className="store-primary" onClick={()=>document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}>SHOP NOW <span>→</span></button>
      </section>
    </main>

    <footer className="store-footer"><b>CHEATCODE™</b><span>YOU CAN CHEAT WITHOUT REGRET.</span><span>© 2026 CHEATCODE</span></footer>

    {cartOpen&&<div className="store-overlay" onMouseDown={e=>e.target===e.currentTarget&&setCartOpen(false)}>
      <aside className="cart-drawer"><div className="drawer-head"><div><span className="store-kicker">YOUR ORDER</span><h2>THE CHEAT.</h2></div><button onClick={()=>setCartOpen(false)}>×</button></div>
        {cart.length?<><div className="cart-items">{cart.map(x=><div className="cart-item" key={x.id}><img src={x.image} alt=""/><div><b>{x.name}</b><small>₹{PRICE} / tub</small><div className="qty"><button onClick={()=>change(x.id,-1)}>−</button><span>{x.quantity}</span><button onClick={()=>change(x.id,1)}>+</button></div></div><strong>₹{x.quantity*PRICE}</strong></div>)}</div>
        <div className="cart-foot"><div><span>SUBTOTAL</span><b>₹{total}</b></div><p>Cold delivery across Ahmedabad.</p><button className="store-primary full" onClick={()=>{setCheckoutOpen(true);setCartOpen(false)}}>CHECKOUT →</button></div></>
        :<div className="empty-cart"><div>YOUR CART IS<br/><i>EMPTY.</i></div><button className="store-primary" onClick={()=>{setCartOpen(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}}>SHOP FLAVOURS →</button></div>}
      </aside>
    </div>}

    {checkoutOpen&&<div className="store-overlay" onMouseDown={e=>e.target===e.currentTarget&&!busy&&setCheckoutOpen(false)}>
      <div className="checkout-ecom"><button className="checkout-x" disabled={busy} onClick={()=>setCheckoutOpen(false)}>×</button><span className="store-kicker">CHECKOUT / AHMEDABAD</span><h2>YOUR DETAILS.<br/><i>THEN WE CHEAT.</i></h2>
        <div className="checkout-summary">{cart.map(x=><div key={x.id}><span>{x.name} × {x.quantity}</span><b>₹{x.quantity*PRICE}</b></div>)}<div className="checkout-grand"><span>TOTAL</span><b>₹{total}</b></div></div>
        <form onSubmit={pay} className="ecom-form">
          <input name="name" value={customer.name} onChange={update} placeholder="FULL NAME" required/>
          <input name="phone" value={customer.phone} onChange={update} placeholder="10-DIGIT PHONE" inputMode="numeric" maxLength="10" required/>
          <input name="email" value={customer.email} onChange={update} type="email" placeholder="EMAIL ADDRESS"/>
          <input name="address" value={customer.address} onChange={update} placeholder="FULL DELIVERY ADDRESS" required/>
          <div><input name="city" value={customer.city} onChange={update} placeholder="CITY" required/><input name="pincode" value={customer.pincode} onChange={update} placeholder="PINCODE" inputMode="numeric" maxLength="6" required/></div>
          <button className="store-primary full" disabled={busy}>{busy?"PROCESSING…":"PAY ₹"+total+" →"}</button>
          {status&&<p className="checkout-status">{status}</p>}
        </form>
      </div>
    </div>}
  </div>
}
export default App;
