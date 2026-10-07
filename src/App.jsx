import React, { useEffect, useState } from "react";

const API = "https://script.google.com/macros/s/AKfycbzX2i0JOw5HED9JnEOEs3gwDKZgEfpvRHN1b2VS6VYlFDJVBZDrlCwCBjTEKD8EuCVipg/exec";
const flavours = [
 { name:"VANILLA",sub:"CRUNCH",image:"/images/vanilla-crunch.webp" },
 { name:"GUAVA",sub:"CHILLI",image:"/images/guava-chilli.webp" },
 { name:"BELGIAN",sub:"CHOCOLATE",image:"/images/belgian-chocolate.webp" },
 { name:"BLUEBERRY",sub:"CHEESECAKE",image:"/images/blueberry-cheesecake.webp" },
 { name:"MIDNIGHT",sub:"COOKIES",image:"/images/midnight-cookies.webp" },
];
function SEO(){useEffect(()=>{const p=window.location.pathname;const data=p==="/about"?{title:"Our Story | CHEATCODE Protein Ice Cream",description:"The story behind CHEATCODE, a premium protein ice cream brand built in Ahmedabad around indulgence, protein, fibre and smarter choices.",canonical:"https://houseofcheatcode.com/about"}:p==="/why-cheatcode"?{title:"Why CHEATCODE | Protein Ice Cream Without Regret",description:"Discover why CHEATCODE makes premium protein ice cream with 10g protein, zero added sugar, high fibre and a bold Gen Z point of view.",canonical:"https://houseofcheatcode.com/why-cheatcode"}:{title:"CHEATCODE | Premium Protein Ice Cream",description:"CHEATCODE is premium protein ice cream with 10g protein, zero added sugar, high fibre and low carb positioning. Launching in Ahmedabad.",canonical:"https://houseofcheatcode.com/"};document.title=data.title;const meta=(name,content)=>{let e=document.head.querySelector('meta[name="'+name+'"]');if(!e){e=document.createElement("meta");e.name=name;document.head.appendChild(e)}e.content=content};meta("description",data.description);meta("robots","index,follow,max-image-preview:large");let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement("link");link.rel="canonical";document.head.appendChild(link)}link.href=data.canonical;let old=document.head.querySelector("#cc-business-schema");if(old)old.remove();const s=document.createElement("script");s.id="cc-business-schema";s.type="application/ld+json";s.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Brand","name":"CHEATCODE","url":"https://houseofcheatcode.com/","description":data.description,"areaServed":"Ahmedabad, Gujarat, India","sameAs":["https://www.instagram.com/houseofcheatcode/"]});document.head.appendChild(s);},[]);return null}
function Count(){const [time,setTime]=useState(0);useEffect(()=>{const tick=()=>setTime(Math.max(0,new Date("2026-10-11T00:00:00+05:30")-Date.now()));tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);const values=[Math.floor(time/864e5),Math.floor(time/36e5)%24,Math.floor(time/6e4)%60,Math.floor(time/1e3)%60];return <div className="count" aria-label="Countdown to launch">{values.map((v,i)=><div key={i}><b>{String(v).padStart(2,"0")}</b><small>{["DAYS","HOURS","MIN","SEC"][i]}</small></div>)}</div>}
function HeroProduct(){const [index,setIndex]=useState(0);useEffect(()=>{let timer;const advance=()=>{setIndex(c=>(c+1)%flavours.length);timer=setTimeout(advance,5000)};timer=setTimeout(advance,5000);return()=>clearTimeout(timer)},[]);return <div className="hero-slider" aria-label="CHEATCODE flavour showcase">{flavours.map((f,i)=><div className={`hero-slide ${i===index?"active":""}`} key={f.name+f.sub}><Product src={f.image}/><div className="hero-flavour-label">{f.name} {f.sub}</div></div>)}<button className="hero-prev" onClick={()=>setIndex(c=>(c-1+flavours.length)%flavours.length)} aria-label="Previous flavour">‹</button><button className="hero-next" onClick={()=>setIndex(c=>(c+1)%flavours.length)} aria-label="Next flavour">›</button><div className="hero-dots" aria-hidden="true">{flavours.map((f,i)=><span className={i===index?"active":""} key={f.name}/>)}</div></div>}
function Product({src}){const altMap={"vanilla-crunch.webp":"CHEATCODE Vanilla Crunch protein ice cream tub","guava-chilli.webp":"CHEATCODE Guava Chilli protein ice cream tub","belgian-chocolate.webp":"CHEATCODE Belgian Chocolate protein ice cream tub","blueberry-cheesecake.webp":"CHEATCODE Blueberry Cheesecake protein ice cream tub","midnight-cookies.webp":"CHEATCODE Midnight Cookies protein ice cream tub"};const file=src.split("/").pop();return <div className="product" aria-hidden="true"><div className="glow"/><img className="pack" src={src} alt={altMap[file]||"CHEATCODE protein ice cream"} loading="eager" decoding="async" fetchPriority="high"/><div className="floor"/></div>}
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


function PageHeader({active}){return <header className="page-header"><a href="/" className="brand-mark">CHEATCODE™</a><nav aria-label="Primary navigation"><a className={active==="why"?"active":""} href="/why-cheatcode">WHY CHEATCODE</a><a className={active==="about"?"active":""} href="/about">OUR STORY</a><a href="/#flavours">FLAVOURS</a><a href="/#launch">LAUNCH</a></nav><a className="header-btn" href="/#signup">ORDER / JOIN ↗</a></header>}

function WhyCheatcode(){return <div className="deep-page why-page"><PageHeader active="why"/><div className="page-ticker">THE CHEATCODE DIFFERENCE · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB ·</div><main>
<section className="page-hero red"><div className="wrap page-hero-grid"><div><span className="eyebrow">01 / WHY CHEATCODE</span><h1>ICE CREAM<br/>WITHOUT<br/>THE TRADE-OFF.</h1><p className="page-lede">You should not have to choose between the dessert you crave and the way you want to feel after it.</p></div><div className="manifesto-card"><span>THE RULE</span><strong>IF IT DOESN'T FEEL LIKE A CHEAT, WE DIDN'T DO IT RIGHT.</strong><small>CHEATCODE™ / BUILT FOR MODERN INDULGENCE</small></div></div></section>
<section className="page-section black"><div className="wrap"><div className="section-intro"><span className="eyebrow redtext">02 / THE PROBLEM</span><h2>“HEALTHY” SHOULD<br/>NOT MEAN <span>BO-RING.</span></h2><p>We looked at the category and saw two extremes. Classic ice cream delivered the pleasure but often came with compromises. “Better for you” options focused so hard on the numbers that the experience got lost.</p></div><div className="why-grid">
<article><b>01</b><h3>CRAVEABLE FIRST.</h3><p>Texture, flavour and the first spoonful come before anything else. Nutrition only matters if you actually want to finish the tub.</p></article>
<article><b>02</b><h3>FUNCTION BUILT IN.</h3><p>Protein and fibre are part of the product architecture, not an afterthought printed on the back of the pack.</p></article>
<article><b>03</b><h3>NO GUILT MARKETING.</h3><p>We are not here to tell you dessert is a reward you have to earn. We are here to make the choice itself feel better.</p></article>
<article><b>04</b><h3>GEN Z, NOT GENERIC.</h3><p>Bold flavours, sharp design and a little attitude. Because better choices can still have personality.</p></article>
</div></div></section>
<section className="page-section white"><div className="wrap formula-section"><div><span className="eyebrow">03 / THE CHEATCODE FORMULA</span><h2>THE NUMBERS<br/>ARE PART<br/>OF THE <em>EXPERIENCE.</em></h2></div><div className="formula-list">
<div><strong>10g</strong><span>PROTEIN PER 125ML TUB</span><p>Made to bring more protein into the dessert moment without turning ice cream into a punishment.</p></div>
<div><strong>0</strong><span>ADDED SUGAR</span><p>Sweetness without adding sugar to the recipe. The goal is indulgence that fits more easily into a mindful routine.</p></div>
<div><strong>HIGH</strong><span>FIBRE</span><p>A fibre-forward formulation that makes the nutrition story more complete.</p></div>
<div><strong>LOW</strong><span>CARB</span><p>A lower-carb positioning for people who want to be intentional about their everyday choices.</p></div>
</div></div></section>
<section className="page-section black"><div className="wrap flavour-story"><span className="eyebrow redtext">04 / PICK YOUR MOOD</span><h2>FIVE FLAVOURS.<br/>ZERO BORING.</h2><div className="why-flavours">{flavours.map((f,i)=><article className="why-flavour" key={f.name+f.sub}><span>0{i+1}</span><b>{f.name}<br/>{f.sub}</b><strong>CHEATCODE™</strong></article>)}</div></div></section>
<section className="page-section red why-close"><div className="wrap"><span className="eyebrow">05 / THE POINT</span><h2>CHEAT THE<br/>OLD RULES.</h2><p>More thought in the recipe. More personality in the brand. More reasons to reach for dessert.</p><a className="pill" href="/#launch">MEET THE DROP <b>↗</b></a></div></section>
</main><footer><b>CHEATCODE™</b><span>You Can Cheat Without Regret.</span><a href="mailto:hello@houseofcheatcode.com">HELLO@HOUSEOFCHEATCODE.COM</a></footer></div>}

function AboutPage(){return <div className="deep-page about-page"><PageHeader active="about"/><div className="page-ticker">THE STORY · FROM CRAVING TO CHEATCODE · AHMEDABAD ·</div><main>
<section className="page-hero black about-hero"><div className="wrap"><span className="eyebrow redtext">01 / OUR STORY</span><h1>WE STARTED<br/>WITH A<br/><span>CRAVING.</span></h1><p className="page-lede">Not a business plan. Not a nutrition lecture. A very simple question: why couldn't ice cream be genuinely indulgent and still make a little more sense?</p></div></section>
<section className="story-marquee red"><div>CHEAT WITHOUT REGRET · CHEAT WITHOUT REGRET · CHEAT WITHOUT REGRET ·</div></section>
<section className="page-section white"><div className="wrap about-story-grid"><div><span className="eyebrow">02 / THE BEGINNING</span><h2>WE DIDN'T<br/>WANT TO<br/>MAKE ANOTHER<br/><em>“HEALTH”</em><br/>ICE CREAM.</h2></div><div className="long-copy"><p className="big">We wanted the kind of ice cream you would actually crave on a random Tuesday night.</p><p>That meant starting with the part people love. Creamy texture. Big flavour. The little moment when the spoon hits the tub and you know you are having dessert.</p><p>Then we worked backwards. How do we build more protein into the experience? How do we remove added sugar? How do we make fibre and a lower-carb positioning part of the formulation without making the product feel like a compromise?</p><p>That thinking became CHEATCODE.</p><strong>THE PRODUCT CAME FIRST. THE BRAND FOLLOWED.</strong></div></div></section>
<section className="page-section black"><div className="wrap about-principles"><div className="section-intro"><span className="eyebrow redtext">03 / WHAT WE BELIEVE</span><h2>BETTER<br/>CHOICES CAN<br/>STILL BE <span>FUN.</span></h2></div><div className="principle-list">
<div><span>01</span><h3>PLEASURE IS NOT THE ENEMY.</h3><p>We do not believe enjoying dessert means you failed at being disciplined. Food is allowed to be fun.</p></div>
<div><span>02</span><h3>FUNCTION SHOULD FEEL NATURAL.</h3><p>Protein, fibre and smarter formulation should disappear into the experience instead of taking it over.</p></div>
<div><span>03</span><h3>BRANDS SHOULD HAVE A POINT OF VIEW.</h3><p>CHEATCODE is loud because the category does not need another beige, apologetic version of “better.”</p></div>
<div><span>04</span><h3>WE ARE BUILDING BEYOND ONE TUB.</h3><p>Ice cream is where we start. The bigger idea is a world of indulgence that feels less restrictive and more considered.</p></div>
</div></div></section>
<section className="page-section red founder-note"><div className="wrap founder-grid"><div><span className="eyebrow">04 / FROM AHMEDABAD</span><h2>BUILT HERE.<br/>MADE TO<br/><span>GO FURTHER.</span></h2></div><div><p>CHEATCODE is launching in Ahmedabad because this is where the first version of the idea is being tested, tasted, packed and delivered.</p><p>We are starting close to home, listening hard and building in public. Every flavour, every order and every piece of feedback is part of the next version.</p><a className="outline" href="/#signup">FOLLOW THE BUILD ↗</a></div></div></section>
<section className="page-section white about-future"><div className="wrap founder-grid"><div><span className="eyebrow">05 / THE FUTURE</span><h2>ICE CREAM<br/>IS ONLY<br/><em>THE START.</em></h2></div><div><p>We are not building CHEATCODE to be one more ice cream sitting in one more freezer.</p><p>The bigger vision is a modern indulgence brand. More products, more flavours, more ways to enjoy the things you already love while making smarter choices feel normal.</p><p>Ahmedabad is our first playground. The ambition is much bigger. We want CHEATCODE to grow from a local launch into a brand people across India recognise for taste, attitude and better formulated indulgence.</p><strong>START SMALL. THINK LOUD. BUILD THE CATEGORY WE WISH EXISTED.</strong></div></div></section>
<section className="page-section black about-final"><div className="wrap"><span className="eyebrow redtext">06 / THE PROMISE</span><h2>YOU CAN<br/><span>CHEAT</span><br/>WITHOUT<br/>REGRET.</h2><p>That is not permission to stop caring. It is an invitation to stop believing that caring means giving up the things you love.</p><a className="pill" href="/#launch">EXPLORE CHEATCODE <b>↗</b></a></div></section>
</main><footer><b>CHEATCODE™</b><span>You Can Cheat Without Regret.</span><a href="mailto:hello@houseofcheatcode.com">HELLO@HOUSEOFCHEATCODE.COM</a></footer></div>}
\nexport default function App(){const path=window.location.pathname;if(path==="/why-cheatcode"){return <><SEO/><WhyCheatcode/></>}if(path==="/about"){return <><SEO/><AboutPage/></>}if(path==="/lab-report"){return <LabReport/>}if(path==="/admin/orders"){return <AdminOrders/>}return <><SEO/><div className="site"><header><a href="/" className="brand-mark">CHEATCODE™</a><nav aria-label="Primary navigation"><a href="/why-cheatcode">WHY CHEATCODE</a><a href="/about">OUR STORY</a><a href="#flavours">FLAVOURS</a><a href="#launch">LAUNCH</a></nav><a className="header-btn" href="#signup">GET NOTIFIED ↗</a></header><div className="ticker" aria-label="CHEATCODE highlights"><div className="ticker-track"><span>YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span><span aria-hidden="true">YOU CAN CHEAT WITHOUT REGRET · 10g PROTEIN · 0 ADDED SUGAR · HIGH FIBRE · LOW CARB · LAUNCHING 11.10.26 ·</span></div></div><main>
<section className="hero red"><div className="wrap hero-grid"><div className="hero-copy"><span className="eyebrow">01 / PREMIUM HIGH-PROTEIN ICE CREAM</span><h1>CHEAT<br/>WITHOUT<br/>REGRET.</h1><p className="hero-tag">Same pleasure.<br/>Better choices.</p><a className="pill" href="#flavours">DISCOVER CHEATCODE <b>↗</b></a><div className="stats"><span><b>10g</b>PROTEIN</span><span><b>0</b>ADDED SUGAR</span><span><b>HIGH</b>FIBRE</span><span><b>LOW</b>CARB</span></div></div><div className="hero-product"><HeroProduct/></div></div></section>
<section className="black flavours-sec" id="flavours"><div className="wrap"><div className="center"><span className="eyebrow redtext">02 / THE LINE-UP</span><h2>5 WAYS TO CHEAT.</h2><p className="muted">Different moods. Same CHEATCODE.</p></div><div className="flavour-row">{flavours.map((f,i)=><article key={f.name+"-"+f.sub}><img className="mini-pack" src={f.image} alt={f.name+" "+f.sub+" CHEATCODE ice cream"} loading="lazy" decoding="async"/><span>0{i+1}</span><h3>{f.name}<br/>{f.sub}</h3></article>)}</div><div className="benefits">{[["10g","Protein"],["0","Added Sugar"],["High","Fibre"],["Low","Carb"]].map(([t,l])=><div key={l}><i>◉</i><b>{t}</b><small>{l}</small></div>)}</div></div></section>
<section className="black split"><div className="image-panel"><img className="section3-image" src="/images/Cheatcode Section 3.JPG" alt="CHEATCODE ice cream brand visual" loading="lazy" decoding="async"/></div><div className="copy-panel"><span className="eyebrow redtext">03 / THE BETTER INDULGENCE</span><h2>DESSERT<br/>THAT WORKS<br/>FOR YOU.</h2><p>Creamy texture. Bold flavours. Thought-through nutrition. Built for the moments when you want dessert and still want to feel good about the choice.</p><a className="outline" href="#story">READ OUR STORY ↗</a></div></section>
<section className="white story" id="story"><div className="wrap story-grid"><div><span className="eyebrow">04 / THE CHEATCODE</span><h2>WE DIDN’T<br/>WANT TO MAKE<br/>ANOTHER<br/><span>"HEALTHY"</span><br/>ICE CREAM.</h2></div><div><p className="big">We wanted the kind of ice cream you’d actually crave.</p><p>So we built CHEATCODE for the moments when you want to indulge without feeling like you abandoned your goals.</p><strong>THAT’S THE CHEAT.</strong></div></div></section>
<section className="red launch" id="launch"><div className="wrap"><span className="eyebrow">05 / LAUNCHING ON</span><h2>11.10.26</h2><Count/><p className="launch-note">THE WAIT IS ALMOST OVER.<br/>SEE YOU ON LAUNCH DAY.</p></div><div className="launch-product"><HeroProduct/></div></section>
<section className="black order-start"><div className="wrap order-start-inner"><span className="eyebrow redtext">06 / ORDERS OPEN 11.10.26</span><div className="order-start-grid"><div className="order-date">11 OCT</div><div className="order-copy"><h2>YOUR CHEATCODE<br/>IS ONE CLICK AWAY.</h2><p>Order directly from our website and get your favourite flavour delivered across Ahmedabad in just half an hour.</p><CheckoutButton/></div></div></div></section>
<Signup/><section className="black follow"><div className="wrap"><span className="eyebrow redtext">08 / FOLLOW THE BUILD</span><h2>@HOUSEOFCHEATCODE</h2><p className="muted">Flavour testing. Packaging. First batches. Launch preparation. The real build, before the first scoop.</p><a className="outline" href="https://www.instagram.com/houseofcheatcode/" target="_blank" rel="noreferrer">FOLLOW ON INSTAGRAM ↗</a></div></section><section className="black faq" id="faq"><div className="wrap"><div className="faq-head"><span className="eyebrow redtext">09 / YOU ASKED. WE CHEATED.</span><h2>FAQ, BUT MAKE IT<br/><span>CHEATCODE.</span></h2><p className="muted">Everything you actually wanna know before the first scoop.</p></div><div className="faq-list">
{[
["Okay, so what exactly is CHEATCODE?","Basically? Ice cream, but with a little more thought behind it. CHEATCODE is made with 10g protein, 0 added sugar, high fibre and a low-carb positioning because dessert should still feel like dessert."],
["How much protein is actually in it?","10g per serving. Yep, you still get the creamy, indulgent ice cream moment without skipping the protein."],
["Wait zero added sugar?","Yep. CHEATCODE is made with 0 added sugar, so you can enjoy the sweet stuff without added sugar in the recipe."],
["Is it actually low carb?","That’s the idea. CHEATCODE is positioned as a low-carb ice cream for people who want to be a little more mindful about what goes into their dessert."],
["What flavours are we talking about?","Five for launch: Vanilla Crunch, Guava Chilli, Belgian Chocolate, Blueberry Cheesecake and Midnight Cookies. Pick your mood."],
["When can I finally get my hands on it?","11 October 2026. That’s launch day. Set the reminder. Tell your group chat."],
["Where can I order CHEATCODE?","Right here on the CHEATCODE website from launch day. We’re starting with delivery across Ahmedabad."],
["How quick is delivery in Ahmedabad?","We’re planning around 30-minute delivery across Ahmedabad from the website, depending on delivery availability at your location."],
["So… is CHEATCODE a "healthy" ice cream?","We’d call it a more thoughtful way to do dessert. You get 10g protein, 0 added sugar, high fibre and low-carb positioning without pretending ice cream has to stop being fun."],
["Where do I follow the chaos?","@houseofcheatcode on Instagram. That’s where we’re dropping flavours, behind-the-scenes stuff, launch updates and everything happening before the first scoop."],
].map(([q,a],i)=><details key={q}><summary><span>{String(i+1).padStart(2,"0")}</span><h3>{q}</h3><b>+</b></summary><p>{a}</p></details>)}
</div></div></section><section className="red final"><div className="wrap"><span className="eyebrow">10 / CHEATCODE™</span><h2>YOUR NEXT<br/>CHEAT IS<br/>ALMOST HERE.</h2><p>11.10.26</p></div></section></main><button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top">↑</button><footer><b>CHEATCODE™</b><span>You Can Cheat Without Regret.</span><a href="mailto:hello@houseofcheatcode.com">HELLO@HOUSEOFCHEATCODE.COM</a></footer><</div></>}