import React, { useEffect, useState } from "react";

const API = "https://script.google.com/macros/s/AKfycbzX2i0JOw5HED9JnEOEs3gwDKZgEfpvRHN1b2VS6VYlFDJVBZDrlCwCBjTEKD8EuCVipg/exec";
const flavours = [
  { name:"VANILLA",sub:"CRUNCH",image:"/images/vanilla-crunch.webp" },
  { name:"GUAVA",sub:"CHILLI",image:"/images/guava-chilli.webp" },
  { name:"BELGIAN",sub:"CHOCOLATE",image:"/images/belgian-chocolate.webp" },
  { name:"BLUEBERRY",sub:"CHEESECAKE",image:"/images/blueberry-cheesecake.webp" },
  { name:"MIDNIGHT",sub:"COOKIES",image:"/images/midnight-cookies.webp" },
];
function Count(){const [time,setTime]=useState(0);useEffect(()=>{const tick=()=>setTime(Math.max(0,new Date("2026-10-11T00:00:00+05:30")-Date.now()));tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);const values=[Math.floor(time/864e5),Math.floor(time/36e5)%24,Math.floor(time/6e4)%60,Math.floor(time/1e3)%60];return <div className="count" aria-label="Countdown to launch">{values.map((v,i)=><div key={i}><b>{String(v).padStart(2,"0")}</b><small>{["DAYS","HOURS","MIN","SEC"][i]}</small></div>)}</div>}
function HeroProduct(){const [index,setIndex]=useState(0);useEffect(()=>{let timer;const advance=()=>{setIndex(c=>(c+1)%flavours.length);timer=setTimeout(advance,5000)};timer=setTimeout(advance,5000);return()=>clearTimeout(timer)},[]);return <div className="hero-slider" aria-label="CHEATCODE flavour showcase">{flavours.map((f,i)=><div className={`hero-slide ${i===index?"active":""}`} key={f.name+f.sub}><Product src={f.image}/><div className="hero-flavour-label">{f.name} {f.sub}</div></div>)}<button className="hero-prev" onClick={()=>setIndex(c=>(c-1+flavours.length)%flavours.length)} aria-label="Previous flavour">‹</button><button className="hero-next" onClick={()=>setIndex(c=>(c+1)%flavours.length)} aria-label="Next flavour">›</button><div className="hero-dots" aria-hidden="true">{flavours.map((f,i)=><span className={i===index?"active":""} key={f.name}/>)}</div></div>}
function Product({src}){return <div className="product" aria-hidden="true"><div className="glow"/><img className="pack" src={src} alt="" loading="eager" decoding="async" fetchPriority="high"/><div className="floor"/></div>}
function CheckoutButton(){
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  const [open,setOpen]=useState(false);
  const [customer,setCustomer]=useState({name:"",phone:"",email:"",address:"",city:"Ahmedabad",state:"Gujarat",pincode:""});
  const [quantity,setQuantity]=useState(1);
  const [flavour,setFlavour]=useState("Belgian Chocolate");

  async function loadRazorpay(){
    if(window.Razorpay)return true;
    return new Promise(resolve=>{
      const existing=document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if(existing){existing.addEventListener("load",()=>resolve(true),{once:true});existing.addEventListener("error",()=>resolve(false),{once:true});return;}
      const script=document.createElement("script");
      script.src="https://checkout.razorpay.com/v1/checkout.js";script.async=true;
      script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script);
    });
  }

  function update(e){setCustomer(c=>({...c,[e.target.name]:e.target.value}));}

  async function startPayment(e){
    e.preventDefault(); if(busy)return;
    setBusy(true);setStatus("");
    try{
      const loaded=await loadRazorpay();
      if(!loaded)throw new Error("Payment checkout could not load. Please try again.");
      let keyId=import.meta.env.VITE_RAZORPAY_KEY_ID;
      if(!keyId){
        const configRes=await fetch("/api/razorpay-config");
        const configData=await configRes.json().catch(()=>({})); keyId=configData.key_id;
      }
      if(!keyId)throw new Error("Razorpay is not configured.");

      const orderResponse=await fetch("/api/create-order",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({customer,items:[{name:flavour,quantity}]})
      });
      const order=await orderResponse.json().catch(()=>({}));
      if(!orderResponse.ok||!order.order_id)throw new Error(order.error||"Could not create your order.");

      const options={
        key:keyId,amount:order.amount,currency:order.currency,name:"CHEATCODE™",
        description:`${flavour} × ${quantity}`,order_id:order.order_id,theme:{color:"#ff1616"},
        prefill:{name:customer.name,email:customer.email,contact:customer.phone},
        notes:{order_number:order.order_number},
        handler:async function(response){
          try{
            const verifyResponse=await fetch("/api/verify-payment",{
              method:"POST",headers:{"Content-Type":"application/json"},
              body:JSON.stringify(response)
            });
            const result=await verifyResponse.json().catch(()=>({}));
            if(!verifyResponse.ok||!result.verified)throw new Error(result.error||"Payment verification failed.");
            setStatus(`PAYMENT SUCCESSFUL · ORDER #${order.order_number}`);
            setOpen(false);
          }catch(error){setStatus(error.message||"Payment verification failed.");}
          finally{setBusy(false);}
        },
        modal:{ondismiss:()=>{setBusy(false);setStatus("PAYMENT CANCELLED.");}},
      };
      const rzp=new window.Razorpay(options);
      rzp.on("payment.failed",response=>{setBusy(false);setStatus(response?.error?.description||"Payment failed. Please try again.");});
      rzp.open();
    }catch(error){setBusy(false);setStatus(error.message||"Something went wrong. Please try again.");}
  }

  return <div className="checkout-wrap">
    <button type="button" className="pill order-cta checkout-cta" onClick={()=>setOpen(true)} disabled={busy}>ORDER NOW ₹149 <b>→</b></button>
    {status&&<p className="payment-status" role="status">{status}</p>}
    {open&&<div className="checkout-overlay" role="dialog" aria-modal="true" aria-label="CHEATCODE checkout">
      <div className="checkout-card">
        <button className="checkout-close" type="button" onClick={()=>setOpen(false)} aria-label="Close checkout">×</button>
        <span className="eyebrow redtext">CHEATCODE / CHECKOUT</span>
        <h3>YOUR CHEAT.<br/>YOUR DETAILS.</h3>
        <form onSubmit={startPayment} className="checkout-form">
          <div className="checkout-row">
            <input name="name" value={customer.name} onChange={update} placeholder="FULL NAME" required/>
            <input name="phone" value={customer.phone} onChange={update} placeholder="PHONE NUMBER" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" required/>
          </div>
          <input name="email" type="email" value={customer.email} onChange={update} placeholder="EMAIL ADDRESS"/>
          <input name="address" value={customer.address} onChange={update} placeholder="FULL DELIVERY ADDRESS" required/>
          <div className="checkout-row">
            <input name="city" value={customer.city} onChange={update} placeholder="CITY" required/>
            <input name="pincode" value={customer.pincode} onChange={update} placeholder="PINCODE" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required/>
          </div>
          <div className="checkout-row">
            <select value={flavour} onChange={e=>setFlavour(e.target.value)} aria-label="Flavour">
              {flavours.map(f=><option key={f.name+f.sub} value={f.name.charAt(0)+f.name.slice(1).toLowerCase()+" "+f.sub.charAt(0)+f.sub.slice(1).toLowerCase()}>{f.name} {f.sub}</option>)}
            </select>
            <select value={quantity} onChange={e=>setQuantity(Number(e.target.value))} aria-label="Quantity">
              {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} TUB{n>1?"S":""}</option>)}
            </select>
          </div>
          <div className="checkout-total"><span>TOTAL</span><strong>₹{149*quantity}</strong></div>
          <button className="pill checkout-pay" type="submit" disabled={busy}>{busy?"PROCESSING…":`PAY ₹${149*quantity} →`}</button>
        </form>
      </div>
    </div>}
  </div>;
}

function Signup(){const [done,setDone]=useState(false),[busy,setBusy]=useState(false);async function submit(e){e.preventDefault();if(busy)return;setBusy(true);const data=Object.fromEntries(new FormData(e.currentTarget));const params=new URLSearchParams({name:String(data.name||""),email:String(data.email||""),phone:String(data.phone||"")});try{await fetch(API+"?"+params.toString(),{method:"GET",mode:"no-cors",keepalive:true});setDone(true);e.currentTarget.reset()}catch{setBusy(false)}}return <section className="black signup" id="signup"><div className="wrap signup-grid"><div><span className="eyebrow">07 / GET IN EARLY</span><h2>DON’T MISS<br/>THE DROP.</h2><p className="muted">Get launch-day news, first access and the occasional CHEATCODE surprise.</p></div>{done?<div className="success">✓ YOU’RE ON THE LIST.<br/><span>SEE YOU ON LAUNCH DAY.</span></div>:<form onSubmit={submit}><input name="name" placeholder="YOUR NAME" required/><input name="email" type="email" placeholder="EMAIL ADDRESS" required/><input name="phone" placeholder="PHONE NUMBER" required/><button disabled={busy}>{busy?"JOINING…":"GET NOTIFIED →"}</button></form>}</div></section>}
function LabReport(){return <main className="lab-report-page"><div className="lab-report-card"><span className="eyebrow redtext">CHEATCODE™ / LAB REPORT</span><h1>LAB REPORT</h1><p>Scan complete. Your CHEATCODE lab report will appear here.</p><div className="lab-report-pdf"><div className="lab-report-placeholder">PDF REPORT<br/><small>COMING SOON</small></div></div></div></main>}

function AdminOrders(){
  const [password,setPassword]=useState("");
  const [orders,setOrders]=useState([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  async function load(p=password){
    setLoading(true);setError("");
    try{
      const r=await fetch("/api/admin-orders",{headers:{"x-admin-password":p}});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||"Unable to load orders.");
      setOrders(d.orders||[]);sessionStorage.setItem("cc_admin_password",p);
    }catch(e){setError(e.message);setOrders([]);}
    finally{setLoading(false);}
  }
  useEffect(()=>{const p=sessionStorage.getItem("cc_admin_password");if(p){setPassword(p);load(p)}},[]);
  async function updateOrder(id,status){
    const r=await fetch("/api/admin-update-order",{method:"PATCH",headers:{"Content-Type":"application/json","x-admin-password":password},body:JSON.stringify({order_id:id,order_status:status})});
    const d=await r.json();if(!r.ok){setError(d.error||"Update failed.");return}
    setOrders(os=>os.map(o=>o.id===id?{...o,order_status:status}:o));
  }
  if(!sessionStorage.getItem("cc_admin_password")||!orders.length&&!password){
    return <main className="admin-page"><div className="admin-login"><span className="eyebrow redtext">CHEATCODE / ADMIN</span><h1>ORDERS.</h1><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="ADMIN PASSWORD" onKeyDown={e=>e.key==="Enter"&&load()}/><button className="pill" onClick={()=>load()} disabled={loading}>{loading?"CHECKING…":"OPEN ORDERS →"}</button>{error&&<p className="admin-error">{error}</p>}</div></main>;
  }
  return <main className="admin-page"><div className="admin-wrap"><div className="admin-head"><div><span className="eyebrow redtext">CHEATCODE / ADMIN</span><h1>ORDERS.</h1></div><button className="outline" onClick={()=>load()}>REFRESH ↻</button></div>{error&&<p className="admin-error">{error}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>AMOUNT</th><th>PAYMENT</th><th>STATUS</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>#{o.order_number}</b><small>{new Date(o.created_at).toLocaleString("en-IN")}</small></td><td><b>{o.customer_name}</b><small>{o.phone}<br/>{o.email||""}</small><small>{o.address}, {o.city}, {o.pincode}</small></td><td>{(o.items||[]).map((i,idx)=><div key={idx}>{i.name} × {i.quantity}</div>)}</td><td><b>₹{o.total_amount}</b></td><td><span className={`status-badge ${o.payment_status}`}>{o.payment_status}</span><small>{o.razorpay_payment_id||"—"}</small></td><td><select value={o.order_status} onChange={e=>updateOrder(o.id,e.target.value)}><option value="pending">Pending</option><option value="processing">Processing</option><option value="packed">Packed</option><option value="shipped">Shipped</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option><option value="payment_failed">Payment failed</option></select></td></tr>)}{!orders.length&&<tr><td colSpan="6">No orders yet.</td></tr>}</tbody></table></div></div></main>;
}

export default function App(){if(window.location.pathname==="/lab-report"){return <LabReport/>}if(window.location.pathname==="/admin/orders"){return <AdminOrders/>}return <div className="site"><header><a href="#" className="brand-mark">CHEATCODE™</a><nav aria-label="Primary navigation"><a href="#flavours">FLAVOURS</a><a href="#story">OUR STORY</a><a href="#launch">LAUNCH</a></nav><a className="header-btn" href="#signup">GET NOTIFIED ↗</a></header><div className="ticker" aria-label="CHEATCODE highlights"><div className="ticker-track"><span>YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span><span aria-hidden="true">YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span></div></div><main>
<section className="hero red"><div className="wrap hero-grid"><div className="hero-copy"><span className="eyebrow">01 / PREMIUM HIGH-PROTEIN ICE CREAM</span><h1>CHEAT<br/>WITHOUT<br/>REGRET.</h1><p className="hero-tag">Same pleasure.<br/>Better choices.</p><a className="pill" href="#flavours">DISCOVER CHEATCODE <b>↗</b></a><div className="stats"><span><b>10g</b>PROTEIN</span><span><b>0</b>ADDED SUGAR</span><span><b>HIGH</b>FIBRE</span><span><b>LOW</b>CARB</span></div></div><div className="hero-product"><HeroProduct/></div></div></section>
<section className="black flavours-sec" id="flavours"><div className="wrap"><div className="center"><span className="eyebrow redtext">02 / THE LINE-UP</span><h2>5 WAYS TO CHEAT.</h2><p className="muted">Different moods. Same CHEATCODE.</p></div><div className="flavour-row">{flavours.map((f,i)=><article key={f.name+"-"+f.sub}><img className="mini-pack" src={f.image} alt={f.name+" "+f.sub+" CHEATCODE ice cream"} loading="lazy" decoding="async"/><span>0{i+1}</span><h3>{f.name}<br/>{f.sub}</h3></article>)}</div><div className="benefits">{[["10g","Protein"],["0","Added Sugar"],["High","Fibre"],["Low","Carb"]].map(([t,l])=><div key={l}><i>◉</i><b>{t}</b><small>{l}</small></div>)}</div></div></section>
<section className="black split"><div className="image-panel"><img className="section3-image" src="/images/Cheatcode Section 3.JPG" alt="CHEATCODE ice cream brand visual" loading="lazy" decoding="async"/></div><div className="copy-panel"><span className="eyebrow redtext">03 / THE BETTER INDULGENCE</span><h2>DESSERT<br/>THAT WORKS<br/>FOR YOU.</h2><p>Creamy texture. Bold flavours. Thought-through nutrition. Built for the moments when you want dessert and still want to feel good about the choice.</p><a className="outline" href="#story">READ OUR STORY ↗</a></div></section>
<section className="white story" id="story"><div className="wrap story-grid"><div><span className="eyebrow">04 / THE CHEATCODE</span><h2>WE DIDN’T<br/>WANT TO MAKE<br/>ANOTHER<br/><span>“HEALTHY”</span><br/>ICE CREAM.</h2></div><div><p className="big">We wanted the kind of ice cream you’d actually crave.</p><p>So we built CHEATCODE for the moments when you want to indulge without feeling like you abandoned your goals.</p><strong>THAT’S THE CHEAT.</strong></div></div></section>
<section className="red launch" id="launch"><div className="wrap"><span className="eyebrow">05 / LAUNCHING ON</span><h2>11.10.26</h2><Count/><p className="launch-note">THE WAIT IS ALMOST OVER.<br/>SEE YOU ON LAUNCH DAY.</p></div><div className="launch-product"><HeroProduct/></div></section>
<section className="black order-start"><div className="wrap order-start-inner"><span className="eyebrow redtext">06 / ORDERS OPEN 11.10.26</span><div className="order-start-grid"><div className="order-date">11 OCT</div><div className="order-copy"><h2>YOUR CHEATCODE<br/>IS ONE CLICK AWAY.</h2><p>Order directly from our website and get your favourite flavour delivered across Ahmedabad in just half an hour.</p><CheckoutButton/></div></div></div></section>
<Signup/><section className="black follow"><div className="wrap"><span className="eyebrow redtext">08 / FOLLOW THE BUILD</span><h2>@HOUSEOFCHEATCODE</h2><p className="muted">Flavour testing. Packaging. First batches. Launch preparation. The real build, before the first scoop.</p><a className="outline" href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noreferrer">FOLLOW ON INSTAGRAM ↗</a></div></section><section className="black faq" id="faq"><div className="wrap"><div className="faq-head"><span className="eyebrow redtext">09 / YOU ASKED. WE CHEATED.</span><h2>FAQ, BUT MAKE IT<br/><span>CHEATCODE.</span></h2><p className="muted">Everything you actually wanna know before the first scoop.</p></div><div className="faq-list">
{[
["Okay, so what exactly is CHEATCODE?","Basically? Ice cream, but with a little more thought behind it. CHEATCODE is made with 10g protein, 0 added sugar, high fibre and a low-carb positioning  because dessert should still feel like dessert."],
["How much protein is actually in it?","10g per serving. Yep, you still get the creamy, indulgent ice cream moment without skipping the protein."],
["Wait  zero added sugar?","Yep. CHEATCODE is made with 0 added sugar, so you can enjoy the sweet stuff without added sugar in the recipe."],
["Is it actually low carb?","That’s the idea. CHEATCODE is positioned as a low-carb ice cream for people who want to be a little more mindful about what goes into their dessert."],
["What flavours are we talking about?","Five for launch: Vanilla Crunch, Guava Chilli, Belgian Chocolate, Blueberry Cheesecake and Midnight Cookies. Pick your mood."],
["When can I finally get my hands on it?","11 October 2026. That’s launch day. Set the reminder. Tell your group chat."],
["Where can I order CHEATCODE?","Right here on the CHEATCODE website from launch day. We’re starting with delivery across Ahmedabad."],
["How quick is delivery in Ahmedabad?","We’re planning around 30-minute delivery across Ahmedabad from the website, depending on delivery availability at your location."],
["So… is CHEATCODE a “healthy” ice cream?","We’d call it a more thoughtful way to do dessert. You get 10g protein, 0 added sugar, high fibre and low-carb positioning  without pretending ice cream has to stop being fun."],
["Where do I follow the chaos?","@houseofcheatcode on Instagram. That’s where we’re dropping flavours, behind-the-scenes stuff, launch updates and everything happening before the first scoop."],
].map(([q,a],i)=><details key={q}><summary><span>{String(i+1).padStart(2,"0")}</span><h3>{q}</h3><b>+</b></summary><p>{a}</p></details>)}
</div></div></section><section className="red final"><div className="wrap"><span className="eyebrow">10 / CHEATCODE™</span><h2>YOUR NEXT<br/>CHEAT IS<br/>ALMOST HERE.</h2><p>11.10.26</p></div></section></main><button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top">↑</button><footer><b>CHEATCODE™</b><span>You Can Cheat Without Regret.</span><a href="mailto:hello@houseofcheatcode.com">HELLO@HOUSEOFCHEATCODE.COM</a></footer></div>}