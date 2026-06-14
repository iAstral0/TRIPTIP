const API = 'http://localhost:8000/api';

/* jastip-crowdshipping.js — logic for jastip-crowdshipping */
/* Replace DUMMY DATA blocks with fetch() calls to your Laravel API */

/* ── Shared utilities (also in jastip.js for production) ── */
  function showToast(msg,dur=2400){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),dur);}
  function formatRp(n){return 'Rp '+(n||0).toLocaleString('id-ID');}
  function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');window.scrollTo(0,0);}
  function closeOverlay(id){const el=document.getElementById(id);if(el)el.classList.remove('show');}
  function closeOv(id){closeOverlay(id);}
  function openOverlay(id){const el=document.getElementById(id);if(el)el.classList.add('show');}
const ME='Kamu', ME_EMOJI='😊';

// ── DATA ──────────────────────────────────────────────────────────────────────
let groups=[
  // AS MEMBER — open, item list active, adding items
  {id:'g1',brand:'Nike',country:'🇺🇸 USA',link:'https://www.nike.com',
   categories:'Shoes, Clothing, Accessories',maxMembers:5,
   members:['Budi','Sarah','Andi',ME],ownerIdx:0,
   status:'open',listState:'open',deadline:'2026-05-15',autoHours:24,
   desc:'1. Max 3 items per person\n2. Shoes and clothing only\n3. Must pay within 48h of price confirmed\n4. No returns after purchase\n5. Items must be in stock on Nike.com',
   joined:true,createdAt:'20 April 2026',orderId:'#CS001'},

  // AS MEMBER — prices set, YOU need to review & pay
  {id:'g2',brand:'Uniqlo',country:'🇯🇵 Japan',link:'https://www.uniqlo.com/jp',
   categories:'Clothing, Accessories, Heattech',maxMembers:8,
   members:['Rina',ME,'Michael','Dani','Hana'],ownerIdx:0,
   status:'collecting',listState:'price_review',deadline:'2026-05-10',autoHours:0,
   groupTax:75000,taxPerMember:15000,
   desc:'1. Uniqlo Japan exclusives only\n2. Max 5 items per person\n3. Confirm price within 24h or auto-removed\n4. No resale items',
   joined:true,createdAt:'18 April 2026',orderId:'#CS002'},

  // AS MEMBER — all paid, owner is buying
  {id:'g3',brand:'Muji',country:'🇯🇵 Japan',link:'https://www.muji.com/jp',
   categories:'Stationery, Home, Clothing, Skincare',maxMembers:6,
   members:['Tono',ME,'Lina','Putri','Rizal'],ownerIdx:0,
   status:'collecting',listState:'payment',deadline:'2026-05-08',autoHours:48,
   groupTax:60000,taxPerMember:12000,
   desc:'1. Min 3 items per person\n2. Stationery, home, clothing only\n3. No food items\n4. Auto-close list after 48h',
   joined:true,createdAt:'22 April 2026',orderId:'#CS003'},

  // AS MEMBER — distributing, you haven't confirmed receipt yet
  {id:'g4',brand:'ZARA',country:'🇫🇷 France',link:'https://www.zara.com',
   categories:'Clothing, Bags, Accessories',maxMembers:5,
   members:['Maya',ME,'Kevin','Sari'],ownerIdx:0,
   status:'collecting',listState:'collecting',deadline:'2026-05-04',autoHours:24,
   desc:'1. ZARA Paris store items only\n2. Max 2 items per person\n3. Confirm receipt within 24h',
   joined:true,createdAt:'15 April 2026',orderId:'#CS004'},

  // NOT JOINED — open, can join
  {id:'g5',brand:'Adidas',country:'🇩🇪 Germany',link:'https://www.adidas.de',
   categories:'Shoes, Sportswear, Bags',maxMembers:6,
   members:['Fajar','Dewi'],ownerIdx:0,
   status:'open',listState:'none',deadline:'2026-05-25',autoHours:24,
   desc:'1. Max 3 items per person\n2. Adidas original items only\n3. No Yeezy\n4. Must pay within 48h',
   joined:false,createdAt:'28 April 2026',orderId:'#CS005'},

  // NOT JOINED — full, cannot join
  {id:'g6',brand:'Lululemon',country:'🇦🇺 Australia',link:'https://www.lululemon.com.au',
   categories:'Sportswear, Yoga, Accessories',maxMembers:4,
   members:['Sinta','Reza','Clara','Andi'],ownerIdx:0,
   status:'full',listState:'price_review',deadline:'2026-05-12',autoHours:0,
   desc:'1. Lululemon AU items\n2. Max 2 items\n3. Price in AUD converted to IDR',
   joined:false,createdAt:'12 April 2026',orderId:'#CS006'},

  // YOU ARE OWNER — list just closed, need to SET PRICES
  {id:'g7',brand:'H&M',country:'🇸🇪 Sweden',link:'https://www.hm.com',
   categories:'Clothing, Accessories, Home',maxMembers:6,
   members:[ME,'Bagas','Tari','Rio','Indra'],ownerIdx:0,
   status:'open',listState:'closed',deadline:'2026-05-18',autoHours:0,
   desc:'1. H&M Sweden exclusives and sale items\n2. Max 4 items per person\n3. Clothing and accessories only\n4. Must pay within 48h of price confirmed',
   joined:true,createdAt:'25 April 2026',orderId:'#CS007'},

  // YOU ARE OWNER — prices set, Wulan still hasn't paid
  {id:'g8',brand:'The North Face',country:'🇰🇷 Korea',link:'https://www.thenorthface.co.kr',
   categories:'Outdoor, Jackets, Bags',maxMembers:5,
   members:[ME,'Sasha','Wulan','Doni'],ownerIdx:0,
   status:'open',listState:'pricing',deadline:'2026-05-09',autoHours:24,
   desc:'1. TNF Korea limited edition items\n2. Max 2 items per person\n3. Jackets and bags only\n4. No returns',
   joined:true,createdAt:'20 April 2026',orderId:'#CS008'},

  // YOU ARE OWNER — all paid, you need to go BUY now
  {id:'g9',brand:'COS',country:'🇬🇧 UK',link:'https://www.cos.com',
   categories:'Clothing, Accessories',maxMembers:4,
   members:[ME,'Nanda','Fitri','Claudia'],ownerIdx:0,
   status:'collecting',listState:'collecting',deadline:'2026-04-30',autoHours:0,
   desc:'1. COS UK items only\n2. Max 3 items per person\n3. Minimal and classic styles\n4. Must pay within 24h of price confirmed',
   joined:true,createdAt:'10 April 2026',orderId:'#CS009'},
];



let chats={
  // g1: open list, lively chat
  'g1':[
    {from:'sys',text:'Budi created this group for Nike USA 🇺🇸'},
    {from:'Budi',text:"Welcome! I'll order from Nike.com on May 15. Add your items 👇",time:'10.00',emoji:'👨'},
    {from:'Sarah',text:"Can you get Air Force 1 White size 38?",time:'10.15',emoji:'👩'},
    {from:'Budi',text:"Yes it's available! Add to the item list.",time:'10.20',emoji:'👨'},
    {from:'Andi',text:"Added my Dri-FIT tee and cap 🙌",time:'10.25',emoji:'🧑'},
    {from:ME,text:"Added my Air Max 270! Please confirm size 42 is in stock 🙏",time:'10.30',emoji:'😊'},
    {from:'Budi',text:"Checked — all in stock. Deadline May 13, I'll close and price then.",time:'10.35',emoji:'👨'},
    {from:'sys',text:'Budi opened an item list! Members can now add their items. 📋'},
    {from:'Sarah',text:"Done, submitted mine!",time:'10.45',emoji:'👩'},
  ],
  // g2: prices set, you need to review & pay
  'g2':[
    {from:'sys',text:'Rina created this group for Uniqlo Japan 🇯🇵'},
    {from:'Rina',text:"Hi! I'll be in Shinjuku Uniqlo on May 15. Submit items by May 10 please.",time:'09.00',emoji:'👩'},
    {from:'Michael',text:"Adding Heattech now 😍",time:'09.10',emoji:'👨'},
    {from:'Dani',text:"Can I get the fleece jacket in Navy?",time:'09.15',emoji:'🧑'},
    {from:'Rina',text:"I'll check but Navy might be out of stock. Submit it and I'll confirm.",time:'09.20',emoji:'👩'},
    {from:ME,text:"Submitted my U Puffer Jacket and Merino sweater! 🤞",time:'09.30',emoji:'😊'},
    {from:'sys',text:'Item list closed. Rina is reviewing and setting prices.'},
    {from:'Rina',text:"Checked everything at the store. Setting prices based on today's price tags 🏷️",time:'14.00',emoji:'👩'},
    {from:'sys',text:'Rina set prices for all items. Members — check notification to review and pay! 📢'},
    {from:'Hana',text:"Paid mine! Thanks Rina 🙏",time:'14.30',emoji:'👧'},
    {from:'Michael',text:"Paid too! 😊",time:'14.45',emoji:'👨'},
    {from:'Dani',text:"My item got denied 😔 Is Navy really out of stock?",time:'15.00',emoji:'🧑'},
    {from:'Rina',text:"Yes, checked 3 stores. Beige and Brown are available if you want?",time:'15.05',emoji:'👩'},
    {from:'Dani',text:"Okay resubmitting with Beige, thanks!",time:'15.10',emoji:'🧑'},
  ],
  // g3: buying — all paid, owner at Muji Ginza
  'g3':[
    {from:'sys',text:'Tono created this group for Muji Japan 🇯🇵'},
    {from:'Tono',text:"Hi all! Going to Muji Ginza on May 8. Min 3 items per person for shipping to make sense 🙏",time:'08.00',emoji:'🧑'},
    {from:ME,text:"Added 3 items — pens, face wash, and the linen shirt 😊",time:'08.20',emoji:'😊'},
    {from:'Lina',text:"Adding notebooks and pens!",time:'08.25',emoji:'👩'},
    {from:'Putri',text:"Adding skincare set and stationery",time:'08.30',emoji:'👩'},
    {from:'Rizal',text:"Added my items! Excited for the Muji cologne 🙌",time:'08.45',emoji:'👨'},
    {from:'sys',text:'Item list auto-closed after 48h. Tono is setting prices.'},
    {from:'Tono',text:"Prices set based on Muji website. Receipt uploaded. Everyone please pay!",time:'12.00',emoji:'🧑'},
    {from:'sys',text:'All members paid! 💰 Tono — you may start buying.'},
    {from:'Tono',text:"Just arrived at Muji Ginza! Found most items. Posting store photos 📸",time:'09.00',emoji:'🧑'},
    {from:'Tono',img:'https://images.unsplash.com/photo-1583394293214-0d0e7cec0ea1?w=300&q=80',text:'Store haul!',time:'09.05',emoji:'🧑'},
    {from:'Lina',text:"I can see my notebooks!! 😭🎉",time:'09.10',emoji:'👩'},
    {from:'Tono',text:"All bought! Packing everything now 📦",time:'10.30',emoji:'🧑'},
    {from:'sys',text:'💰 All items purchased! Tono will ship in 2-3 days.'},
  ],
  // g4: distributing, you haven't confirmed yet
  'g4':[
    {from:'sys',text:'Maya created this group for ZARA France 🇫🇷'},
    {from:'Maya',text:"Bonjour! Going to ZARA Champs-Élysées. Max 2 items each.",time:'10.00',emoji:'👩'},
    {from:ME,text:"Added beige trench coat and crossbody bag 🙏",time:'10.20',emoji:'😊'},
    {from:'Kevin',text:"Added navy blazer and slim trousers",time:'10.25',emoji:'👨'},
    {from:'Sari',text:"Submitted printed dress and tote bag 🌸",time:'10.30',emoji:'👩'},
    {from:'sys',text:'Maya closed the item list and set prices. Members — check notification to pay! 📢'},
    {from:'sys',text:'All members paid! 💰 Maya is now buying.'},
    {from:'Maya',text:"Bought everything! Distributing via GoBox tomorrow 📦",time:'16.00',emoji:'👩'},
    {from:'sys',text:'Maya is distributing items to members. 📦'},
    {from:'Kevin',text:"Got mine! Items are perfect ✅",time:'12.00',emoji:'👨'},
    {from:'Sari',text:"Received! The dress is gorgeous 😍 Confirming!",time:'12.30',emoji:'👩'},
    {from:'Maya',text:"Kamu — your GoBox departs at 2pm today! 😊",time:'13.00',emoji:'👩'},
  ],
  // g5: open, not joined
  'g5':[
    {from:'sys',text:'Fajar created this group for Adidas Germany 🇩🇪'},
    {from:'Fajar',text:"Hi! Going to Adidas Berlin. Originals only. Feel free to join!",time:'09.00',emoji:'👨'},
    {from:'Dewi',text:"Joined! Want the Samba OG in white 😍",time:'09.15',emoji:'👩'},
  ],
  // g6: full
  'g6':[
    {from:'sys',text:'Sinta created this group for Lululemon Australia 🇦🇺'},
    {from:'Sinta',text:"Group is now full. Waiting for all members to pay 😊",time:'08.00',emoji:'👩'},
  ],
  // g7: YOU OWNER — list closed, need to set prices
  'g7':[
    {from:'sys',text:'Kamu created this group for H&M Sweden 🇸🇪'},
    {from:ME,text:"Hi everyone! Going to H&M Stockholm next week. Add items by May 16 😊",time:'08.00',emoji:'😊'},
    {from:'Bagas',text:"Great! I've always wanted H&M Sweden exclusives. Adding now!",time:'08.20',emoji:'👨'},
    {from:'Tari',text:"Added mine! The linen dress and earrings 🌸",time:'08.35',emoji:'👩'},
    {from:'Rio',text:"Done! Relaxed blazer and white tee added",time:'08.50',emoji:'🧑'},
    {from:'Indra',text:"Submitted 3 items — cargo trousers look nice",time:'09.00',emoji:'👨'},
    {from:ME,text:"Amazing! Heading to the store now to check availability. Will set prices today 👍",time:'09.10',emoji:'😊'},
    {from:'sys',text:'Item list closed. Kamu is reviewing and setting prices.'},
    {from:'Bagas',text:"Waiting for prices! Take your time Kamu 🙏",time:'09.20',emoji:'👨'},
    {from:'Tari',text:"Excited! 😊",time:'09.25',emoji:'👩'},
    {from:ME,text:"Just got to the store — checking all items now. Will upload receipt with prices shortly 🏷️",time:'11.00',emoji:'😊'},
  ],
  // g8: YOU OWNER — prices set, Wulan hasn't paid
  'g8':[
    {from:'sys',text:'Kamu created this group for The North Face Korea 🇰🇷'},
    {from:ME,text:"Hi! TNF Korea has amazing limited edition jackets this season. Going to Seoul next week 🙌",time:'10.00',emoji:'😊'},
    {from:'Sasha',text:"I've been eyeing the Nuptse jacket forever! Joining 🎉",time:'10.15',emoji:'👩'},
    {from:'Wulan',text:"Added the backpack and fleece. Hope they're in stock!",time:'10.20',emoji:'👩'},
    {from:'Doni',text:"Adding summit series jacket in black, size L",time:'10.30',emoji:'👨'},
    {from:'sys',text:'Item list closed. Kamu is setting prices.'},
    {from:ME,text:"Checked at TNF Myeongdong — everything available! Prices set. Receipt uploaded 🧾",time:'14.00',emoji:'😊'},
    {from:'sys',text:'Kamu set prices for all items. Members — check notification to pay! 📢'},
    {from:'Sasha',text:"Paid! Prices look right 💸 Thank you!",time:'14.30',emoji:'👩'},
    {from:'Doni',text:"Wait the Nuptse is 2.85M? 😅",time:'14.45',emoji:'👨'},
    {from:ME,text:"That's the current store price for the limited edition colourway, receipt is attached above 😊",time:'14.50',emoji:'😊'},
    {from:'Doni',text:"Fair enough, paid! 🙏",time:'15.00',emoji:'👨'},
    {from:'sys',text:'Doni paid to escrow ✅'},
    {from:ME,text:"Waiting for Wulan to pay 😊",time:'15.30',emoji:'😊'},
    {from:'Wulan',text:"Sorry was in a meeting! Paying now 💸",time:'16.00',emoji:'👩'},
  ],
  // g9: YOU OWNER — all paid, ready to buy
  'g9':[
    {from:'sys',text:'Kamu created this group for COS UK 🇬🇧'},
    {from:ME,text:"Hi! Going to COS London next week. Classic minimal pieces. Let me know what you want 😊",time:'09.00',emoji:'😊'},
    {from:'Nanda',text:"The COS wide-leg trousers are on my wishlist forever! Adding now",time:'09.15',emoji:'👩'},
    {from:'Fitri',text:"Adding the oversized shirt and linen blazer 🤍",time:'09.25',emoji:'👩'},
    {from:ME,text:"Both great choices! I'll check in store 👍",time:'09.30',emoji:'😊'},
    {from:'sys',text:'Item list closed. Kamu is setting prices.'},
    {from:ME,text:"Checked COS Regent Street — all in stock! Prices set. Receipt uploaded 🧾",time:'13.00',emoji:'😊'},
    {from:'sys',text:'Kamu set prices for all items. Members — check notification to pay! 📢'},
    {from:'Nanda',text:"Paid! Price is totally fair, thank you! 💸",time:'13.30',emoji:'👩'},
    {from:'Fitri',text:"Paid too! Finally getting that blazer 😭🎉",time:'14.00',emoji:'👩'},
    {from:'sys',text:'💰 All members have paid! Kamu — you may now start buying.'},
    {from:'Nanda',text:"Kamu you're good to go!! 🎉",time:'14.15',emoji:'👩'},
    {from:ME,text:"Heading to COS Regent Street tomorrow! Will post photos 📸",time:'14.30',emoji:'😊'},
    {from:'sys',text:'Kamu is now buying all items. 🛒'},
    {from:ME,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',text:'Got everything from COS! Packing now 📦',time:'11.00',emoji:'😊'},
    {from:'sys',text:'Kamu is distributing items to members. 📦'},
    {from:ME,text:"Nanda — your parcel via GoBox is on the way! Should arrive today.",time:'13.00',emoji:'😊'},
    {from:'Nanda',text:"Just received it! Everything is perfect 😍 Confirming now ✅",time:'14.00',emoji:'👩'},
    {from:'sys',text:'Nanda confirmed receipt ✅ — escrow payment released for Nanda.'},
    {from:ME,text:"Fitri — your parcel was sent via GoBox this afternoon!",time:'15.00',emoji:'😊'},
    {from:'Fitri',text:"Great! Waiting for it 🙏",time:'15.05',emoji:'👩'},
    {from:'Claudia',text:"Mine is on the way too right?",time:'15.10',emoji:'👩'},
    {from:ME,text:"Yes Claudia, yours goes out tomorrow morning 😊",time:'15.15',emoji:'😊'},
    {from:'Fitri',text:"Hi, the GoBox arrived but it only has the blazer — the shirt and bag are missing 😢",time:'17.00',emoji:'👩'},
    {from:'Fitri',text:"I'm pressing ❌ Not Received because my order is incomplete",time:'17.02',emoji:'👩'},
    {from:'sys',text:'Fitri denied receipt — some items may be missing. Owner please check and resend proof.'},
    {from:ME,text:"Oh no, I'm so sorry Fitri! Let me check — I think I may have packed yours with Claudia's by mistake 😓",time:'17.10',emoji:'😊'},
    {from:ME,text:"I'm sending the correct items via GoBox Express now. Will send a new proof photo shortly!",time:'17.15',emoji:'😊'},
  ],
};



let itemLists={
  // G1: list OPEN — all items pending, you can still add/edit
  'g1':{
    'Sarah':[{name:'Nike Air Force 1 White Size 38',qty:1,status:'pending',price:null,deniedReason:null}],
    'Andi': [{name:'Nike Dri-FIT Tee Size M Black',qty:2,status:'pending',price:null,deniedReason:null},
             {name:'Nike Cap Black Unstructured',qty:1,status:'pending',price:null,deniedReason:null}],
    [ME]:   [{name:'Nike Air Max 270 Size 42 Triple Black',qty:1,status:'pending',price:null,deniedReason:null}],
  },
  // G2: price_review — owner set prices, YOU must review: accept or deny
  // Michael paid, Dani's item denied by owner, Hana accepted (waiting to pay)
  // YOU have items with price set — status 'price_set' = waiting for your decision
  'g2':{
    'Michael':[{name:'Heattech Extra Warm Long Sleeve L',qty:2,status:'paid',price:320000,deniedReason:null}],
    'Dani':   [{name:'Fleece Full-Zip Jacket M Navy',qty:1,status:'denied',price:null,deniedReason:'Out of stock in Navy. Available: Beige, Brown, or Olive.'}],
    'Hana':   [{name:'AIRism Cotton T-Shirt S White',qty:2,status:'price_set',price:189000,deniedReason:null},
               {name:'AIRism Cotton T-Shirt S Black',qty:1,status:'price_set',price:189000,deniedReason:null}],
    [ME]:     [{name:'Uniqlo U Puffer Jacket XS Black',qty:1,status:'price_set',price:580000,deniedReason:null},
               {name:'Merino Wool Crew Neck Sweater S Navy',qty:1,status:'price_set',price:420000,deniedReason:null}],
  },
  // G3: payment — prices accepted by all, YOU must pay to escrow (others already paid)
  'g3':{
    'Lina': [{name:'Muji Recycled Notebook A5 (5-pack)',qty:1,status:'paid',price:85000,deniedReason:null},
             {name:'Muji 0.5mm Ballpoint Pens (10-pack)',qty:1,status:'paid',price:120000,deniedReason:null},
             {name:'Muji Acrylic Ruler Set',qty:1,status:'paid',price:55000,deniedReason:null}],
    [ME]:   [{name:'Muji Gel Ink Pen 0.38mm (5-pack)',qty:2,status:'accepted',price:95000,deniedReason:null},
             {name:'Muji Foam Face Wash 150ml',qty:1,status:'accepted',price:125000,deniedReason:null},
             {name:'Muji Linen Blend Shirt Size S',qty:1,status:'accepted',price:380000,deniedReason:null}],
    'Putri':[{name:'Muji Sensitive Skin Face Wash',qty:2,status:'paid',price:145000,deniedReason:null},
             {name:'Muji Lotion Light 200ml',qty:1,status:'paid',price:180000,deniedReason:null},
             {name:'Muji Acrylic Pencil Case',qty:2,status:'paid',price:65000,deniedReason:null}],
    'Rizal':[{name:'Muji Eau de Toilette No.1',qty:1,status:'paid',price:320000,deniedReason:null},
             {name:'Muji Stainless Steel Mug 350ml',qty:1,status:'paid',price:210000,deniedReason:null},
             {name:'Muji Compact Umbrella',qty:1,status:'paid',price:150000,deniedReason:null}],
  },
  // G4: collecting — Kevin confirmed given, Sari waiting, YOU not yet given by owner
  'g4':{
    [ME]:   [{name:'ZARA Belted Trench Coat Beige S',qty:1,status:'paid',price:980000,deniedReason:null},
             {name:'ZARA Crossbody Bag Black',qty:1,status:'paid',price:520000,deniedReason:null}],
    'Kevin':[{name:'ZARA Navy Blazer Size M',qty:1,status:'paid',price:750000,deniedReason:null},
             {name:'ZARA Slim Fit Trousers M Dark Grey',qty:1,status:'paid',price:480000,deniedReason:null}],
    'Sari': [{name:'ZARA Printed Midi Dress S',qty:1,status:'paid',price:620000,deniedReason:null},
             {name:'ZARA Canvas Tote Bag Natural',qty:1,status:'paid',price:340000,deniedReason:null}],
  },
  // G7: YOU OWNER — list closed (pricing state), items pending — tap Next Step to set prices
  'g7':{
    'Bagas':[{name:'H&M Slim Fit Oxford Shirt M White',qty:2,status:'pending',price:null,deniedReason:null},
             {name:'H&M Chino Trousers M Beige',qty:1,status:'pending',price:null,deniedReason:null}],
    'Tari': [{name:'H&M Linen Blend Midi Dress S Sage',qty:1,status:'pending',price:null,deniedReason:null},
             {name:'H&M Gold Hoop Earrings (set)',qty:2,status:'pending',price:null,deniedReason:null}],
    'Rio':  [{name:'H&M Relaxed Fit Blazer M Beige',qty:1,status:'pending',price:null,deniedReason:null},
             {name:'H&M Premium Cotton Tee M White',qty:3,status:'pending',price:null,deniedReason:null}],
    'Indra':[{name:'H&M Cargo Trousers M Khaki',qty:1,status:'pending',price:null,deniedReason:null},
             {name:'H&M Regular Jeans M Dark Blue',qty:1,status:'pending',price:null,deniedReason:null},
             {name:'H&M Canvas Sneakers EU43 White',qty:1,status:'pending',price:null,deniedReason:null}],
  },
  // G8: YOU OWNER — price_review state
  // Sasha accepted & paid, Doni DENIED price (wants reprice), Wulan accepted & paid
  'g8':{
    'Sasha':[{name:'TNF Nuptse 700 Jacket S Black',qty:1,status:'paid',price:2850000,deniedReason:null}],
    'Wulan':[{name:'TNF Borealis Backpack Black',qty:1,status:'paid',price:1450000,deniedReason:null},
             {name:'TNF 100 Glacier Fleece S Pink',qty:1,status:'paid',price:980000,deniedReason:null}],
    'Doni': [{name:'TNF Summit Series Jacket L Black',qty:1,status:'price_denied',price:3200000,deniedReason:'Price is too high vs website. Website shows Rp 2.8M, not 3.2M.'}],
  },
  // G9: YOU OWNER — collecting state, marking given per member
  // Nanda: owner marked given, Nanda confirmed received
  // Fitri: owner marked given, Fitri hasn't confirmed yet (waiting)
  'g9':{
    'Nanda':[{name:'COS Wide-Leg Tailored Trousers S Black',qty:1,status:'paid',price:1250000,deniedReason:null},
             {name:'COS Leather Loafers EU37 Tan',qty:1,status:'paid',price:1850000,deniedReason:null}],
    'Fitri':[{name:'COS Oversized Cotton Shirt S Ecru',qty:1,status:'paid',price:680000,deniedReason:null},
             {name:'COS Linen Blend Blazer S Dark Grey',qty:1,status:'paid',price:1650000,deniedReason:null},
             {name:'COS Structured Mini Bag Black',qty:1,status:'paid',price:920000,deniedReason:null}],
  },
};



// collectingStatus: owner's marking + member's confirmation
// { memberId: { ownerMark:'given'|'not-given', memberConfirm:'received'|'denied'|null } }
let collectingStatus={
  // G4: Kevin marked+confirmed given, Sari marked given but hasn't confirmed, YOU not marked yet
  'g4':{
    'Kevin':{ ownerMark:'given', memberConfirm:'received' },
    'Sari': { ownerMark:'given', memberConfirm:null },
  },
  // G9: Nanda confirmed, Fitri DENIED (owner must resend proof), Claudia waiting
  'g9':{
    'Nanda' :{ ownerMark:'given', memberConfirm:'received' },
    'Fitri' :{ ownerMark:'given', memberConfirm:'denied' },
    'Claudia':{ ownerMark:'given', memberConfirm:null },
  },
};


let currentGroupId=null;
let myItemRows=[];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function fRp(n){return 'Rp '+n.toLocaleString('id-ID');}
function loading(show,txt='Loading...'){document.getElementById('loaderOv').classList.toggle('show',show);document.getElementById('loaderTxt').textContent=txt;}
function g(){return groups.find(x=>x.id===currentGroupId);}
function isOwner(){const grp=g();return grp&&grp.members[grp.ownerIdx]===ME;}
function now(){const d=new Date();return String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0');}
function pushSys(gid,txt){if(!chats[gid])chats[gid]=[];chats[gid].push({from:'sys',text:txt});}
function pushMsg(gid,from,txt,emoji){if(!chats[gid])chats[gid]=[];chats[gid].push({from,text:txt,time:now(),emoji});}

// ── LIST ──────────────────────────────────────────────────────────────────────
function renderList(list){
  const el=document.getElementById('orderListEl');
  if(!list.length){el.innerHTML='<div style="text-align:center;color:var(--gray-text);padding:60px 20px;font-size:13px">No groups found.</div>';return;}
  const SL={open:'Open',collecting:'Collecting',buying:'Buying',full:'Full',closed:'Closed'};
  const BC={open:'b-open',collecting:'b-collecting',buying:'b-buying',full:'b-full',closed:'b-closed'};

  const myGroups    = list.filter(g=>g.joined);
  const otherGroups = list.filter(g=>!g.joined);

  function cardHtml(grp){
    const locked=grp.status==='full'&&!grp.joined;
    const iAmOwnerCard=grp.members[grp.ownerIdx]===ME;
    const ownerBadge=iAmOwnerCard?`<span style="font-size:10px;background:var(--purple);color:white;padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px">👑 Owner</span>`:'';
    const footerLeft=iAmOwnerCard
      ? `<span class="cc-owner-lbl">👑 You are the Owner</span>`
      : `<span class="cc-owner-lbl">👤 ${grp.members[grp.ownerIdx]} (Owner)</span>`;
    const footerBtn=locked?'':grp.joined
      ?`<button class="cc-view joined" onclick="event.stopPropagation();currentGroupId='${grp.id}';openChat('${grp.id}')">Open Chat 💬</button>`
      :`<button class="cc-view" onclick="event.stopPropagation();openDetail('${grp.id}')">View Details</button>`;
    return `<div class="crowd-card${locked?' locked':''}" onclick="${locked?'showToast(\'This group is full\')':'openDetail(\''+grp.id+'\')'}">
      <div class="cc-hdr">
        <div>
          <div style="display:flex;align-items:center""><div class="cc-brand">${grp.brand}</div>${ownerBadge}</div>
          <div class="cc-country">${grp.country}</div>
        </div>
        <span class="cc-badge ${BC[grp.status]||'b-closed'}">${SL[grp.status]||grp.status}</span>
      </div>
      <div class="cc-tags">${grp.categories.split(',').map(c=>`<span class="cc-tag">${c.trim()}</span>`).join('')}</div>
      <div class="cc-slots"><div class="slots-bar"><div class="slots-fill" style="width:${(grp.members.length/grp.maxMembers)*100}%"></div></div><span class="slots-txt">${grp.members.length}/${grp.maxMembers} members</span></div>
      <div class="cc-footer">${footerLeft}${footerBtn}</div>
    </div>`;
  }

  let html='';
  if(myGroups.length){
    html+=`<div style="font-size:13px;font-weight:700;color:var(--dark);margin-bottom:10px;padding-top:4px">My Groups <span style="color:var(--gray-text);font-weight:400">(${myGroups.length})</span></div>`;
    html+=myGroups.map(cardHtml).join('');
  }
  if(otherGroups.length){
    html+=`<div style="font-size:13px;font-weight:700;color:var(--dark);margin:${myGroups.length?'20px':'4px'} 0 10px;padding-top:${myGroups.length?'4px':'0'}">Discover <span style="color:var(--gray-text);font-weight:400">(${otherGroups.length})</span></div>`;
    html+=otherGroups.map(cardHtml).join('');
  }
  el.innerHTML=html;
}

let currentListTab='my';

// ── Init: render list on page load ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  switchListTab('my');
});

function switchListTab(tab){
  currentListTab=tab;
  document.getElementById('tabMyGroups').classList.toggle('active',tab==='my');
  document.getElementById('tabDiscover').classList.toggle('active',tab==='discover');
  const q=(document.getElementById('listSearchInput')||{}).value||'';
  searchOrders(q);
}

function searchOrders(q){
  q=(q||'').toLowerCase().trim();
  const all=!q?groups:groups.filter(grp=>
    grp.brand.toLowerCase().includes(q)||
    grp.country.toLowerCase().includes(q)||
    grp.categories.toLowerCase().includes(q)
  );
  renderList(currentListTab==='my'?all.filter(g=>g.joined):all.filter(g=>!g.joined));
}

// ── DETAIL ────────────────────────────────────────────────────────────────────
function openDetail(id){
  currentGroupId=id;const grp=g();
  document.getElementById('detailTitle').textContent=grp.brand;
  const rules=grp.desc.split('\n').filter(r=>r.trim());
  const iAmOwner = grp.members[grp.ownerIdx]===ME;

  document.getElementById('detailBody').innerHTML=`
    <div class="detail-hero fade-in"><div class="dh-brand">${grp.brand}</div><div class="dh-country">${grp.country}</div>${grp.link?`<a class="dh-link" href="${grp.link}" target="_blank">🔗 ${grp.link}</a>`:''}</div>
    <div class="stat-grid fade-in">
      <div class="stat-box"><div class="stat-lbl">Members</div><div class="stat-val purple">${grp.members.length} / ${grp.maxMembers}</div></div>
      <div class="stat-box"><div class="stat-lbl">Status</div><div class="stat-val" style="font-size:14px;text-transform:capitalize">${grp.status}</div></div>
      <div class="stat-box"><div class="stat-lbl">Deadline</div><div class="stat-val" style="font-size:13px">${grp.deadline}</div></div>
      <div class="stat-box"><div class="stat-lbl">Categories</div><div class="stat-val" style="font-size:11px;line-height:1.3">${grp.categories}</div></div>
    </div>
    <div style="margin-bottom:16px"><div class="sec-title">Rules</div>${rules.map(r=>`<div class="rule-row"><div class="rule-dot"></div><span>${r}</span></div>`).join('')}</div>
    <div><div class="sec-title">Members (${grp.members.length}/${grp.maxMembers})</div>
    ${grp.members.map((m,i)=>{
      const isOwner = i===grp.ownerIdx;
      const isMe    = m===ME;
      const canKick = iAmOwner && !isOwner;
      // Owner reports members, members report ANYONE (owner or other members)
      const canReport = grp.joined && !isMe;
      // Type: if target is owner → 'owner', if target is member → 'member'
      const rType = isOwner ? 'owner' : 'member';
      return `<div class="mem-row">
        <div class="mem-av">👤</div>
        <div class="mem-name">${m}</div>
        ${isOwner?'<span class="tag-owner">Owner</span>':''}
        ${isMe?'<span class="tag-you">You</span>':''}
        <div style="display:flex;gap:6px;margin-left:auto;align-items:center">
          ${canKick?`<button onclick="kickMember('${m}')" style="padding:5px 10px;background:#FFEBEE;border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;color:var(--red);cursor:pointer">Kick</button>`:''}
          ${canReport?`<button onclick="openReport('${rType}','${m}')" style="padding:5px 10px;background:#FFF5F5;border:1.5px solid #e53935;border-radius:8px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;color:#e53935;cursor:pointer">🚩 Report</button>`:''}
        </div>
      </div>`;
    }).join('')}
    </div>`;

  const btn=document.getElementById('detailCtaBtn');
  if(grp.joined){
    btn.className='cta-btn';
    btn.innerHTML='<span class="btn-txt">Open Group Chat 💬</span>';
    btn.onclick=()=>openChat(id);
  } else if(grp.status==='full'||grp.status==='closed'){
    btn.className='cta-btn gray';
    btn.innerHTML=`<span class="btn-txt">Group is ${grp.status==='full'?'Full':'Closed'}</span>`;
    btn.onclick=null;
  } else {
    btn.className='cta-btn';
    btn.innerHTML='<span class="btn-txt">Join This Group</span>';
    btn.onclick=openJoinSheet;
  }

  // Owner: show Close Group button
  const closeBtn=document.getElementById('detailCloseGroupBtn');
  if(closeBtn) closeBtn.style.display=iAmOwner&&grp.status!=='closed'?'block':'none';

  // Remove old injected report button if any
  const old = document.getElementById('detailReportBtn');
  if(old) old.remove();

  showPage('pgDetail');
}

// ── JOIN ──────────────────────────────────────────────────────────────────────
function openJoinSheet(){const grp=g();document.getElementById('joinSub').textContent=`Join "${grp.brand}" (${grp.country}). You'll be in the group chat and can add items once the owner opens the item list.`;document.getElementById('ovJoin').classList.add('show');}

async function confirmJoin(){
  closeOv('ovJoin');loading(true,'Joining...');
  await new Promise(r=>setTimeout(r,1400));loading(false);
  const grp=g();grp.joined=true;grp.members.push(ME);
  if(grp.members.length>=grp.maxMembers)grp.status='full';
  pushSys(grp.id,`${ME} joined the group! 👋`);
  showToast(`✅ Joined ${grp.brand}!`);switchListTab('my');openChat(grp.id);
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
function openChat(id){
  currentGroupId=id;const grp=g();
  document.getElementById('chatName').textContent=grp.brand+' Group';
  document.getElementById('chatSub').textContent=grp.members.length+' members · '+grp.country;
  // ownerBar removed — Next Step button is now inline in chat
  renderChat();showPage('pgChat');
  // Show/hide report flag in chat header
  const grpForChat = groups.find(g=>g.id===id);
  const isOwnerOfChat = grpForChat && grpForChat.members[grpForChat.ownerIdx]===ME;
  const reportFlag = document.getElementById('chatReportBtn');
  if(reportFlag){
    const reportWho = isOwnerOfChat ? null : grpForChat?.members[grpForChat?.ownerIdx];
    reportFlag.style.display = 'flex';
    reportFlag.onclick = () => openReport(isOwnerOfChat ? 'member' : 'owner', reportWho || 'Owner');
  }
  setTimeout(()=>{
    const b=document.getElementById('chatBody');b.scrollTop=b.scrollHeight;

  },120);
  // Auto-trigger live B member additions if list is already open but empty
  if(id==='gLB'){
    const grp=groups.find(g=>g.id==='gLB');
    const items=itemLists['gLB']||{};
    if(grp&&grp.listState==='open'&&Object.keys(items).length===0){
      triggerLiveB_membersAddItems();
    }
    // If prices were set and Galih denied — auto-fire the deny/reprice conversation
    if(grp&&grp.listState==='pricing'&&!grp._triggered_prices){
      // Prices already set once, Galih is price_denied — fire the chat messages
      grp._triggered_prices=true;
      liveStep('gLB',1000,()=>{
        const gItems=itemLists['gLB']['Galih']||[];
        const hasDenied=gItems.some(i=>i.status==='price_denied');
        if(hasDenied){
          showToast('⚠️ Galih denied the price — reprice needed!');
        }
      });
    }
    // If prices set and waiting for Galih to re-review (price_review with Galih price_set)
    if(grp&&grp.listState==='price_review'){
      const gItems=itemLists['gLB']['Galih']||[];
      const galihPriceSet=gItems.some(i=>i.status==='price_set');
      const galihPaid=gItems.some(i=>i.status==='paid');
      if(galihPriceSet&&!galihPaid&&!grp._triggered_reprice){
        triggerLiveB_afterReprice();
      }
    }
  }
}

function renderChat(){
  const grp=g();
  const msgs=chats[currentGroupId]||[];
  const items=itemLists[currentGroupId]||{};
  const el=document.getElementById('chatBody');
  let html='';

  // ── Notifications for current user (ME) ──────────────────────────────────────
  const myItems=items[ME]||[];
  if(myItems.length && !isOwner()){
    const denied      = myItems.filter(i=>i.status==='denied');
    const priceSet    = myItems.filter(i=>i.status==='price_set');
    const priceDenied = myItems.filter(i=>i.status==='price_denied');
    const accepted    = myItems.filter(i=>i.status==='accepted');

    // Owner denied our item from the list
    if(denied.length){
      html+=`<div class="notif red"><div class="notif-icon">❌</div><div><div class="notif-title">Item(s) Denied by Owner</div><div class="notif-sub">${denied.map(i=>`<b>${i.name}</b>: ${i.deniedReason||'No reason given'}`).join('<br/>')}<br/>You can resubmit a different item.</div><button class="notif-btn red" onclick="openAddItemPage()">Resubmit Item →</button></div></div>`;
    }

    // Owner set prices — info banner only, buttons appear in item list below
    if(priceSet.length){
      const total=priceSet.reduce((s,i)=>s+(i.price*i.qty),0);
      html+=`<div class="notif green"><div class="notif-icon">💰</div><div><div class="notif-title">Owner Set Prices — Review Below!</div><div class="notif-sub">Your items have been priced. Total: <strong>${fRp(total)}</strong>. Use the buttons in the item list below to accept or deny.</div></div></div>`;
    }

    // We denied the price — waiting for owner to reprice
    if(priceDenied.length){
      html+=`<div class="notif orange"><div class="notif-icon">⏳</div><div><div class="notif-title">Waiting for Owner to Reprice</div><div class="notif-sub">${priceDenied.map(i=>`<b>${i.name}</b>: you denied Rp ${i.price?.toLocaleString('id-ID')||'?'}. Reason: ${i.deniedReason}`).join('<br/>')}<br/>Discuss in chat with the owner.</div></div></div>`;
    }

    // Accepted — info only, pay button in item list below
    if(accepted.length && (grp.listState==='payment'||grp.listState==='price_review')){
      const total=accepted.reduce((s,i)=>s+(i.price*i.qty),0) + (grp.taxPerMember||0);
      html+=`<div class="notif blue"><div class="notif-icon">💳</div><div><div class="notif-title">Price Accepted — Pay Below!</div><div class="notif-sub">Total due: <strong>${fRp(total)}</strong>${grp.taxPerMember>0?' (incl. your tax share)':''}. Use the Pay button in the item list below.</div></div></div>`;
    }

    // Buying stage
    if(grp.listState==='buying'){
      html+=`<div class="notif blue"><div class="notif-icon">🛒</div><div><div class="notif-title">Owner is Buying Your Items!</div><div class="notif-sub">All payments received. Owner is now purchasing at the store.</div></div></div>`;
    }
  }
  if(grp.listState==='collecting' && !isOwner()){
    const myCS=(collectingStatus[currentGroupId]||{})[ME]||{};
    const ownerMark=myCS.ownerMark||null;
    const memberConfirm=myCS.memberConfirm||null;
    if(memberConfirm==='received'){
      html+=`<div class="notif green"><div class="notif-icon">📦</div><div>
        <div class="notif-title">Items Received ✅</div>
        <div class="notif-sub">You confirmed receipt of all your items. Escrow payment released to owner.</div>
      </div></div>`;
    } else if(memberConfirm==='denied'){
      html+=`<div class="notif red"><div class="notif-icon">⚠️</div><div>
        <div class="notif-title">Dispute Submitted</div>
        <div class="notif-sub">You reported items not received. Escrow is held. Discuss with owner in chat.</div>
      </div></div>`;
    } else if(ownerMark==='given'){
      html+=`<div class="notif orange"><div class="notif-icon">📬</div><div><div class="notif-title">Owner Marked Your Items as Given</div><div class="notif-sub">Have you received your items? Use the buttons in the item list below to confirm or deny.</div></div></div>`;
    } else {
      // Owner hasn't marked yet
      html+=`<div class="notif orange"><div class="notif-icon">⏳</div><div><div class="notif-title">Waiting for Owner to Distribute</div><div class="notif-sub">The owner is distributing items. You will be notified when yours is marked as given.</div></div></div>`;
    }
  }

  // ── Chat messages ──────────────────────────────────────────────────────────
  html+=msgs.map(m=>{
    if(m.from==='sys')return`<div class="msg-group sys"><div class="sys-bubble">${m.text}</div></div>`;
    const isMe=m.from===ME;
    return`<div class="msg-group ${isMe?'me':'them'}">
      ${!isMe?`<div class="msg-sender">${m.emoji||'👤'} ${m.from}</div>`:''}
      <div class="bubble ${isMe?'me':'them'}">${m.img?`<img src="${m.img}"/>`:''}${m.text||''}</div>
      <div class="msg-time">${m.time||''}</div>
    </div>`;
  }).join('');

  // ── Item list card ─────────────────────────────────────────────────────────
  const memberNames=Object.keys(items);
  if(grp.listState!=='none'){
    const SL2={open:'Open — add items',closed:'Closed',pricing:'Setting prices',priced:'Prices set',price_review:'Review prices',payment:'Awaiting payment',buying:'Buying',collecting:'Distributing',escrow_release:'Releasing Escrow',done:'Complete'};
    const statusCls={'pending':'ils-pending','price_set':'ils-accepted','accepted':'ils-accepted','price_denied':'ils-denied','denied':'ils-denied','paid':'ils-paid','given':'ils-given','not-given':'ils-pending'};
    const grpListState = grp.listState;
    const _myCS = (collectingStatus[currentGroupId]||{})[ME]||{};
    const _myConfirm = _myCS.memberConfirm||null;
    const _paidLabel = grpListState==='collecting'
      ? (_myConfirm==='received' ? 'Retrieved ✓' : _myCS.ownerMark==='given' ? 'Waiting for Delivery' : 'Waiting for Delivery')
      : grpListState==='buying' ? 'Waiting for Delivery' : 'Paid ✓';
    const statusTxt={'pending':'Pending','price_set':'Review Price','accepted':'Accepted ✓','price_denied':'Price Denied','denied':'Denied ✗',
      'paid': _paidLabel,
      'given':'Given ✓','not-given':'Not Given'};
    let memberBlocks = memberNames.length
      ? memberNames.map(mem=>{
          const mItems=items[mem];
          const rows=mItems.map(i=>`<div class="ilc-item-row">
            <span class="ilc-name" style="${i.status==='denied'?'text-decoration:line-through;opacity:0.5':''}">${i.name} ×${i.qty}</span>
            ${i.price?`<span class="ilc-price">${fRp(i.price*i.qty)}</span>`:''}
            <span class="ils ${statusCls[i.status]||'ils-pending'}">${statusTxt[i.status]||i.status}</span>
          </div>`).join('');
          return`<div style="margin-bottom:8px"><span class="ilc-mem-name">👤 ${mem}${mem===ME?' (You)':''}</span>${rows}</div>`;
        }).join('')
      : `<div style="font-size:12px;color:var(--gray-text);padding:6px 0">No items added yet. Members can add their items now.</div>`;
    const canAdd=(grp.listState==='open')&&grp.joined&&!isOwner();
    // Action buttons below item list based on state
    let actionBtn='';
    if(canAdd){
      actionBtn=`<button style="width:100%;padding:9px;background:var(--purple-bg);color:var(--purple);border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer;margin-top:8px" onclick="openAddItemPage()">+ Add / Edit My Items</button>`;
    }
    if(!isOwner()&&myItems.length){
      const hasPriceSet=myItems.some(i=>i.status==='price_set');
      const hasAccepted=myItems.some(i=>i.status==='accepted')&&(grp.listState==='payment'||grp.listState==='price_review');
      const hasCollecting=grp.listState==='collecting';
      const myCS=(collectingStatus[currentGroupId]||{})[ME]||{};
      if(hasPriceSet){
        const total=myItems.filter(i=>i.status==='price_set').reduce((s,i)=>s+(i.price*i.qty),0);
        actionBtn=`<button style="width:100%;padding:11px;background:var(--purple);color:white;border:none;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px" onclick="openPriceReview()">Review Price — ${fRp(total)} →</button>`;
      } else if(hasAccepted){
        const total=myItems.filter(i=>i.status==='accepted').reduce((s,i)=>s+(i.price*i.qty),0);
        actionBtn=`<button style="width:100%;padding:10px;background:var(--purple);color:white;border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;cursor:pointer;margin-top:8px" onclick="openPayment()">💳 Pay to Escrow — ${fRp(total+(grp.taxPerMember||0))}</button>`;
      } else if(hasCollecting&&myCS.ownerMark==='given'&&!myCS.memberConfirm){
        // Find the most recent image in chat from the owner (proof photo)
        const msgs = chats[currentGroupId]||[];
        const proofMsg = [...msgs].reverse().find(m=>m.img&&m.from!==ME);
        const proofHtml = proofMsg
          ? `<div style="margin-top:8px;margin-bottom:6px"><div style="font-size:11px;color:var(--gray-text);margin-bottom:4px">📸 Proof photo from owner:</div><img src="${proofMsg.img}" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px"/></div>`
          : `<div style="font-size:11px;color:var(--gray-text);margin-top:6px;margin-bottom:4px">📸 Owner sent a proof photo in chat above ↑</div>`;
        actionBtn=`${proofHtml}<div style="display:flex;gap:8px;margin-top:6px">
          <button style="flex:1;padding:10px;background:var(--green);color:white;border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;cursor:pointer" onclick="memberConfirmReceived()">✅ Confirm Received</button>
          <button style="flex:1;padding:10px;background:#FFEBEE;color:var(--red);border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;cursor:pointer" onclick="memberDenyReceived()">❌ Not Received</button>
        </div>`;
      }
    }
    html+=`<div class="ilc">
      <div class="ilc-title">📋 Item List <span style="font-size:10px;font-weight:500;color:var(--gray-text)">${SL2[grp.listState]||grp.listState}</span></div>
      ${memberBlocks}
      ${actionBtn}
    </div>`;
  } else if(grp.listState==='none'&&grp.joined){
    if(isOwner()){
      html+=`<div class="ilc"><div class="ilc-title">📋 Item List</div><div style="font-size:12px;color:var(--gray-text);padding:6px 0">No active item list. Tap ▶ Next Step to open one.</div></div>`;
    } else {
      html+=`<div class="ilc"><div class="ilc-title">📋 Item List</div><div style="font-size:12px;color:var(--gray-text);padding:6px 0">Waiting for owner to create an item list...</div></div>`;
    }
  }

  // ── Owner: Next Step button below everything ──────────────────────────────
  if(isOwner()){
    const step=OWNER_STEPS[grp.listState]||OWNER_STEPS['none'];
    html+=`<div style="padding:4px 0 6px">
      <button onclick="ownerNextStep()" style="width:100%;padding:13px;background:var(--purple);color:white;border:none;border-radius:12px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:opacity 0.2s" onmousedown="this.style.opacity=0.75" onmouseup="this.style.opacity=1">
        ▶ ${step.btn}
      </button>
    </div>`;
  }

  el.innerHTML=html;
  setTimeout(()=>{
    el.scrollTop=el.scrollHeight;
    renderRcvChecklist();
  },50);
}

function sendMsg(){const input=document.getElementById('chatInput');const text=input.value.trim();if(!text)return;pushMsg(currentGroupId,ME,text,ME_EMOJI);input.value='';renderChat();setTimeout(()=>{document.getElementById('chatBody').scrollTop=document.getElementById('chatBody').scrollHeight;},50);}
function sendImage(input){if(!input.files||!input.files[0])return;const r=new FileReader();r.onload=e=>{pushMsg(currentGroupId,ME,'',ME_EMOJI);chats[currentGroupId][chats[currentGroupId].length-1].img=e.target.result;chats[currentGroupId][chats[currentGroupId].length-1].time=now();input.value='';renderChat();setTimeout(()=>{document.getElementById('chatBody').scrollTop=document.getElementById('chatBody').scrollHeight;},50);};r.readAsDataURL(input.files[0]);}

// ── ADD ITEMS (member) ────────────────────────────────────────────────────────
function openAddItemPage(){
  const existing=(itemLists[currentGroupId]||{})[ME]||[];
  myItemRows=existing.filter(i=>i.status!=='denied').map(i=>({name:i.name,qty:i.qty||1,note:i.note||''}));
  if(!myItemRows.length)myItemRows=[{name:'',qty:1,note:''}];
  renderMyItemRows();showPage('pgAddItem');
}

function renderMyItemRows(){
  document.getElementById('myItemsContainer').innerHTML=myItemRows.map((item,idx)=>`
    <div style="background:var(--gray-bg);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:12px;font-weight:700;color:var(--purple)">${idx+1}.</span>
        <input type="text" placeholder="Item name (e.g. Nike Air Force 1 White Size 38)" value="${item.name||''}" oninput="myItemRows[${idx}].name=this.value"
          style="flex:1;padding:9px 12px;background:var(--white);border:1.5px solid transparent;border-radius:8px;font-family:'Poppins',sans-serif;font-size:13px;outline:none"/>
        ${myItemRows.length>1?`<button onclick="myItemRows.splice(${idx},1);renderMyItemRows()" style="width:28px;height:28px;background:#FFEBEE;border:none;border-radius:50%;color:var(--red);font-size:16px;cursor:pointer">×</button>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <button onclick="myItemRows[${idx}].qty=Math.max(1,(myItemRows[${idx}].qty||1)-1);renderMyItemRows()" style="width:28px;height:28px;background:var(--white);border:1.5px solid #ddd;border-radius:50%;cursor:pointer;font-size:14px;font-weight:700">−</button>
        <span style="font-size:13px;font-weight:700;min-width:24px;text-align:center">${item.qty||1}x</span>
        <button onclick="myItemRows[${idx}].qty=(myItemRows[${idx}].qty||1)+1;renderMyItemRows()" style="width:28px;height:28px;background:var(--white);border:1.5px solid #ddd;border-radius:50%;cursor:pointer;font-size:14px;font-weight:700">+</button>
        <input type="text" placeholder="Notes, size, colour..." value="${item.note||''}" oninput="myItemRows[${idx}].note=this.value"
          style="flex:1;padding:8px 10px;background:var(--white);border:1.5px solid transparent;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;outline:none;color:var(--gray-text)"/>
      </div>
    </div>`).join('');
}

function addMyItemRow(){myItemRows.push({name:'',qty:1,note:''});renderMyItemRows();}

async function submitMyItems(){
  const filled=myItemRows.filter(i=>i.name.trim());
  if(!filled.length){showToast('⚠️ Please enter at least one item name.');return;}
  const btn=document.querySelector('#pgAddItem .cta-btn');btn.classList.add('loading');
  await new Promise(r=>setTimeout(r,1200));btn.classList.remove('loading');
  if(!itemLists[currentGroupId])itemLists[currentGroupId]={};
  itemLists[currentGroupId][ME]=filled.map(i=>({name:i.name.trim(),qty:i.qty||1,note:i.note||'',status:'pending',price:null,deniedReason:null}));

  pushSys(currentGroupId,`${ME} submitted ${filled.length} item${filled.length>1?'s':''} to the list.`);
  showToast('✅ Items submitted!');showPage('pgChat');setTimeout(renderChat,100);
  // Live simulation trigger
  if(currentGroupId==='gLA') triggerLiveA_afterSubmit();
}

// ── OWNER: SET PRICES ─────────────────────────────────────────────────────────
function showSetPricesPage(){renderSetPricesPage();showPage('pgSetPrices');}

function renderSetPricesPage(){
  const items=itemLists[currentGroupId]||{};
  document.getElementById('setPricesBody').innerHTML=Object.entries(items).map(([mem,mItems])=>`
    <div class="pmb"><div class="pmb-name">👤 ${mem}${mem===ME?' (You)':''}</div>
    ${mItems.map((item,idx)=>{
      // Already paid/accepted — show locked read-only
      if(item.status==='paid'||item.status==='accepted'){
        return `<div class="pmb-item" style="opacity:0.5">
          <span class="pmb-item-name">${item.name} ×${item.qty}</span>
          <span style="font-size:12px;background:var(--green-bg);color:var(--green);padding:3px 8px;border-radius:6px;font-weight:600">${item.status==='paid'?'Paid ✓':'Accepted ✓'}</span>
        </div>`;
      }
      return `<div class="pmb-item" style="${item.status==='price_denied'?'background:#FFF0F0;border-radius:8px;padding:4px 6px;margin-bottom:2px':''}">
        <span class="pmb-item-name">
          ${item.status==='price_denied'?'<span style="color:var(--red);font-size:10px;font-weight:700">DISPUTED — </span>':''}
          ${item.name} ×${item.qty}
          ${item.status==='price_denied'?`<div style="font-size:10px;color:var(--red);margin-top:2px">Reason: ${item.deniedReason||''}</div>`:''}
        </span>
        <input type="number" id="p-${mem}-${idx}" class="pmb-price-input" placeholder="${item.status==='price_denied'?'New price (Rp)':'Price (Rp)'}"
          value="${item.status==='price_denied'?'':item.price||''}"
          style="${item.status==='price_denied'?'border-color:var(--red)':''}"
          ${item.status==='denied'?'disabled style="opacity:0.4"':''}/>
        <button id="deny-${mem}-${idx}" class="pmb-deny${item.status==='denied'?' on':''}" onclick="toggleItemDeny('${mem}',${idx})">${item.status==='denied'?'Denied':'Deny'}</button>
      </div>
      ${item.status==='denied'?`<input id="reason-${mem}-${idx}" class="pmb-reason" placeholder="Reason for denial *" value="${item.deniedReason||''}"/>`:`<div id="reason-${mem}-${idx}"></div>`}`;
    }).join('')}
    </div>`).join('');

  // Restore saved tax and wire live preview
  const grp = g();
  const taxInput = document.getElementById('groupTaxInput');
  if (taxInput) {
    if (grp.groupTax) taxInput.value = grp.groupTax;
    taxInput.addEventListener('input', updateTaxPreview);
    updateTaxPreview();
  }
}

function updateTaxPreview() {
  const grp       = g();
  const taxInput  = document.getElementById('groupTaxInput');
  const preview   = document.getElementById('taxSplitPreview');
  if (!taxInput || !preview) return;
  const totalTax   = parseInt(taxInput.value) || 0;
  // Split by ALL members (including owner), but only customers (non-owner) actually pay
  const totalCount = grp.members.length;          // e.g. 3
  const nonOwners  = grp.members.filter((m, i) => i !== grp.ownerIdx);
  const custCount  = nonOwners.length;             // e.g. 2 customers
  if (!totalTax || !totalCount) {
    preview.textContent = '';
    return;
  }
  const perMember = Math.ceil(totalTax / totalCount);
  preview.textContent = `→ ${fRp(totalTax)} ÷ ${totalCount} members = ${fRp(perMember)} per customer (${custCount} customer${custCount>1?'s':''} pay, owner's share absorbed)`;
}

function toggleItemDeny(mem,idx){
  const item=itemLists[currentGroupId][mem][idx];
  item.status=item.status==='denied'?'pending':'denied';
  if(item.status!=='denied')item.deniedReason=null;
  renderSetPricesPage();
}

function previewReceipt(input){if(!input.files||!input.files[0])return;const r=new FileReader();r.onload=e=>{const box=document.getElementById('receiptBox');let img=box.querySelector('img');if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:120px;object-fit:cover;border-radius:10px';box.appendChild(img);}img.src=e.target.result;document.getElementById('receiptHint').style.display='none';};r.readAsDataURL(input.files[0]);}

function submitPrices(){
  const hasReceipt=document.getElementById('receiptInput').files&&document.getElementById('receiptInput').files[0];
  if(!hasReceipt){showToast('⚠️ Please upload a receipt / price proof photo.');return;}
  const items=itemLists[currentGroupId];let missing=false;
  Object.entries(items).forEach(([mem,mItems])=>{
    mItems.forEach((item,idx)=>{
      // Skip items already paid or accepted — don't touch them
      if(item.status==='paid'||item.status==='accepted') return;
      if(item.status==='denied'){
        const reason=document.getElementById(`reason-${mem}-${idx}`)?.value?.trim();
        if(!reason){missing=true;return;}
        item.deniedReason=reason;
      } else {
        // Only price pending or price_denied items
        const val=parseInt(document.getElementById(`p-${mem}-${idx}`)?.value)||0;
        if(val){item.price=val;item.status='price_set';}
      }
    });
  });
  if(missing){showToast('⚠️ Please provide a reason for each denied item.');return;}

  // Save group tax — split by ALL members, only customers (non-owner) pay
  const grp = g();
  const totalTax   = parseInt(document.getElementById('groupTaxInput')?.value) || 0;
  const totalCount = grp.members.length;   // all members including owner
  const taxPerMember = totalCount > 0 ? Math.ceil(totalTax / totalCount) : 0;
  grp.groupTax     = totalTax;
  grp.taxPerMember = taxPerMember;         // each customer's share

  const wasReprice = Object.values(itemLists[currentGroupId]||{}).some(mi=>mi.some(i=>i.status==='price_set'));
  grp.listState='price_review';

  let repriceMsg = wasReprice
    ? 'Owner updated prices. Members — please review the new prices! 📢'
    : 'Owner set prices for all items. Members — review to accept or deny! 📢';
  if (totalTax > 0) {
    repriceMsg += ` • 🧾 Group tax: ${fRp(totalTax)} (${fRp(taxPerMember)}/member)`;
  }
  pushSys(currentGroupId, repriceMsg);
  showToast('✅ Prices sent! Waiting for members.');showPage('pgChat');
  updateOwnerBtn();
  setTimeout(renderChat,100);
  // Live simulation trigger
  if(currentGroupId==='gLB'){
    const gLBgrp=groups.find(g=>g.id==='gLB');
    const galihItems=itemLists['gLB']['Galih']||[];
    const galihHasPriceSet=galihItems.some(i=>i.status==='price_set');
    if(gLBgrp?._triggered_prices && galihHasPriceSet){
      setTimeout(triggerLiveB_afterReprice, 500);
    } else if(!gLBgrp?._triggered_prices){
      triggerLiveB_afterPrices();
    }
  }
}

// ── MEMBER: PRICE REVIEW ──────────────────────────────────────────────────────
function openPriceReview(){
  var myItems  = (itemLists[currentGroupId]||{})[ME]||[];
  var priceSet = myItems.filter(function(i){return i.status==='price_set';});
  var accepted = myItems.filter(function(i){return i.status==='accepted';});
  var denied   = myItems.filter(function(i){return i.status==='denied';});
  var items    = priceSet.length ? priceSet : accepted;
  if(!items.length){showPage('pgChat');return;}

  var grp            = g();
  var subtotal       = items.reduce(function(s,i){return s+(i.price*i.qty);},0);
  var taxShare       = grp.taxPerMember || 0;
  var total          = subtotal + taxShare;
  var alreadyAccepted = !priceSet.length && accepted.length > 0;

  // ── Build HTML piece by piece ──────────────────────────────────────────────
  var html = '';

  // Denied items notif
  if(denied.length){
    html += '<div class="notif red" style="margin-bottom:14px">'
      + '<div class="notif-icon">❌</div><div>'
      + '<div class="notif-title">Denied Items</div>'
      + '<div class="notif-sub">' + denied.map(function(i){return '<b>'+i.name+'</b>: '+i.deniedReason;}).join('<br/>') + '</div>'
      + '<button class="notif-btn red" onclick="openAddItemPage()">Resubmit →</button>'
      + '</div></div>';
  }

  // Price card
  html += '<div style="background:var(--gray-bg);border-radius:14px;padding:14px;margin-bottom:14px">';
  html += '<div style="font-size:13px;font-weight:700;margin-bottom:10px">Your Items & Prices</div>';

  // Item rows
  items.forEach(function(i){
    html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e8e8e8;font-size:13px">'
      + '<span>' + i.name + ' ×' + i.qty + '</span>'
      + '<span style="font-weight:700">' + fRp(i.price*i.qty) + '</span>'
      + '</div>';
  });

  // Subtotal
  html += '<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:13px">'
    + '<span>Subtotal</span><span>' + fRp(subtotal) + '</span></div>';

  // Tax row — always build it, show only if taxShare > 0
  if(taxShare > 0){
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;font-size:13px;border-bottom:1px solid #e8e8e8">'
      + '<span style="color:#795548;font-weight:600">🧾 Tax / Import Fee'
      + '<br/><span style="font-size:10px;color:#9E9E9E;font-weight:400">'
      + fRp(grp.groupTax||0) + ' total ÷ ' + grp.members.length + ' members'
      + '</span></span>'
      + '<span style="color:#795548;font-weight:700">' + fRp(taxShare) + '</span>'
      + '</div>';
  }

  // Total
  html += '<div style="display:flex;justify-content:space-between;padding:7px 0;font-size:14px;font-weight:700;border-top:1px solid #e8e8e8;margin-top:4px">'
    + '<span>Total to Pay</span>'
    + '<span style="color:var(--purple)">' + fRp(total) + '</span>'
    + '</div>';
  html += '</div>';

  // Accept / Deny / Pay buttons
  if(alreadyAccepted){
    html += '<div style="font-size:12px;color:var(--green);font-weight:600;margin-bottom:14px">✅ You already accepted. Pay to escrow below.</div>';
    html += '<button onclick="openPayment()" style="width:100%;padding:14px;background:var(--purple);border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;color:white;margin-bottom:10px">💳 Pay to Escrow — ' + fRp(total) + '</button>';
  } else {
    html += '<div style="font-size:12px;color:var(--gray-text);line-height:1.6;margin-bottom:14px">Are these prices correct? Accept to proceed to payment, or deny to discuss with the owner.</div>';
    html += '<div style="display:flex;gap:10px;margin-bottom:10px">'
      + '<button onclick="denyPrices()" style="flex:1;padding:14px;background:#FFEBEE;border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;color:var(--red)">❌ Deny</button>'
      + '<button onclick="acceptPrices()" style="flex:1;padding:14px;background:var(--green);border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:14px;font-weight:700;cursor:pointer;color:white">✅ Accept</button>'
      + '</div>';
  }

  html += '<button onclick="showPage(\'pgChat\')" style="width:100%;padding:12px;background:var(--gray-bg);border:none;border-radius:12px;font-family:Poppins,sans-serif;font-size:13px;font-weight:600;cursor:pointer;color:var(--dark)">← Back to Chat</button>';

  document.getElementById('priceReviewBody').innerHTML = html;
  showPage('pgPriceReview');
}

function acceptPrices(){
  // Mark price_set → accepted, go back to chat, pay button shows in item list
  const myItems=(itemLists[currentGroupId]||{})[ME]||[];
  myItems.forEach(i=>{ if(i.status==='price_set') i.status='accepted'; });
  // Don't send chat message here — only send when payment is made
  showToast('✅ Prices accepted! Tap "Pay to Escrow" in the item list below.');
  showPage('pgChat');
  setTimeout(renderChat,100);
}

// acceptAllAndPay replaced by acceptPrices()

function denyPrices(){
  const myItems=(itemLists[currentGroupId]||{})[ME]||[];
  myItems.filter(i=>i.status==='price_set'||i.status==='accepted').forEach(i=>i.status='price_denied');
  // Revert group state so owner can reprice
  const grp=g();
  grp.listState='pricing';
  updateOwnerBtn();
  pushMsg(currentGroupId,ME,'Hi, I want to discuss the price of my items — can we revisit?',ME_EMOJI);
  pushSys(currentGroupId,`${ME} denied the prices. Owner — tap "✅ Send Prices" to update and resend.`);
  showToast('💬 Owner notified — discuss in chat.');
  showPage('pgChat');setTimeout(renderChat,100);
  // Live simulation: if this is the live New Balance group, Arif auto-responds
  if(currentGroupId==='gLA') triggerLiveA_afterDeny();
}

function acceptPricesAndPay(){
  // Check if all members have either accepted or denied
  const grp=g();
  const items=itemLists[currentGroupId]||{};
  const allReviewed=Object.values(items).every(mItems=>mItems.every(i=>i.status!=='accepted'||i.status==='paid'));
  // Move group to payment state so owner knows
  if(grp.listState==='price_review'){
    // Check all members reviewed
    const allAccepted=Object.entries(items).every(([mem,mItems])=>
      mItems.every(i=>i.status==='paid'||i.status==='price_denied'||i.status==='denied'||i.status==='accepted')
    );
  }
  openPayment();
}

// ── PAYMENT ───────────────────────────────────────────────────────────────────
function openPayment(){
  var myItems  = (itemLists[currentGroupId]||{})[ME]||[];
  var accepted = myItems.filter(function(i){return i.status==='accepted';});
  var grp      = g();
  var subtotal = accepted.reduce(function(s,i){return s+(i.price*i.qty);},0);
  var taxShare = grp.taxPerMember || 0;
  var total    = subtotal + taxShare;
  window._payTotal = total;

  var html = '';
  html += '<div style="font-size:15px;font-weight:700;text-align:center;margin-bottom:4px">Payment Summary</div>';
  html += '<div style="font-size:12px;color:var(--gray-text);text-align:center;margin-bottom:14px">' + grp.orderId + ' · ' + grp.brand + '</div>';

  // Item rows
  accepted.forEach(function(i){
    html += '<div class="pay-row"><span>' + i.name + ' ×' + i.qty + '</span><span>' + fRp(i.price*i.qty) + '</span></div>';
  });

  // Subtotal
  html += '<div class="pay-row"><span>Subtotal</span><span>' + fRp(subtotal) + '</span></div>';

  // Tax row
  if(taxShare > 0){
    html += '<div class="pay-row" style="color:#795548">'
      + '<span>🧾 Tax / Import Fee'
      + '<br/><span style="font-size:10px;color:#9E9E9E;font-weight:400">'
      + fRp(grp.groupTax||0) + ' total ÷ ' + grp.members.length + ' members'
      + '</span></span>'
      + '<span style="font-weight:700">' + fRp(taxShare) + '</span>'
      + '</div>';
  }

  // Total
  html += '<div class="pay-row bold"><span>Total to Escrow</span><span style="color:var(--purple)">' + fRp(total) + '</span></div>';

  document.getElementById('payBody').innerHTML = html;
  showPage('pgPayment');
}

function doPayment(){
  const btn   = document.getElementById('payBtn');
  const grp   = g();
  const total = window._payTotal || 0;
  const orderId = (grp.orderId || currentGroupId) + '_' + Date.now();

  midtransPay({
    orderId:      orderId,
    amount:       total,
    customerName: ME,
    onSuccess: function(result) {
      // Mark items as paid locally
      const myItems=(itemLists[currentGroupId]||{})[ME]||[];
      myItems.forEach(i=>{if(i.status==='accepted')i.status='paid';});
      pushMsg(currentGroupId,ME,'I have paid to escrow! 💸',ME_EMOJI);
      pushSys(currentGroupId,`${ME} paid ${fRp(total)} to escrow ✅`);
      const allItems=itemLists[currentGroupId]||{};
      const allPaid=Object.values(allItems).every(mItems=>mItems.every(i=>i.status==='paid'||i.status==='denied'||i.status==='price_denied'));
      if(allPaid){
        g().listState='buying';g().status='buying';
        pushSys(currentGroupId,'💰 All members have paid! Owner — you may now start buying. 🛒');
        updateOwnerBtn();
      }
      showToast('✅ Payment sent to escrow!');
      showPage('pgChat');
    },
    onError: function(msg) {
      showToast('❌ ' + msg);
    }
  });
  setTimeout(renderChat,100);
  // Live simulation triggers
  if(currentGroupId==='gLA') triggerLiveA_afterPay();
  if(currentGroupId==='gLB'){
    const allPaidLB=Object.values(itemLists['gLB']||{}).every(mi=>mi.every(i=>i.status==='paid'||i.status==='denied'));
    if(allPaidLB) triggerLiveB_afterAllPay();
  }
}

// ── OWNER: STATUS ─────────────────────────────────────────────────────────────
// ── Owner state machine ──────────────────────────────────────────────────────
// listState: none → open → pricing → price_review → payment → buying → collecting → done
const OWNER_STEPS = {
  'none':         { btn:'📋 Open Item List',         action: ownerOpenList },
  'open':         { btn:'💰 Close List & Set Prices', action: ownerCloseListAndPrice },
  'closed':       { btn:'💰 Set Prices Now',          action: showSetPricesPage },
  'pricing':      { btn:'✅ Send Prices to Members',  action: showSetPricesPage },
  'price_review': { btn:'⏳ Waiting for Members...',  action: ()=>showToast('Waiting for all members to accept or deny prices.') },
  'payment':      { btn:'⏳ Waiting for Payments...',  action: ()=>showToast('Waiting for all members to pay to escrow.') },
  'buying':       { btn:'📦 Start Distributing',      action: ownerStartDistributing },
  'collecting':   { btn:'📦 Mark Items Given',         action: ()=>showCollectingPage() },
  'escrow_release':{ btn:'💰 Release Escrow to My Account', action: ownerReleaseEscrow },
  'done':         { btn:'📋 Start New Item List',     action: ()=>{ g().listState='none';updateOwnerBtn();renderChat(); } },
};

function updateOwnerBtn(){
  const grp=g(); if(!grp||!isOwner())return;
  // Re-render chat to update the inline next step button
  if(document.getElementById('pgChat')?.classList.contains('active')){
    renderChat();
    // Also update input bar label
    setTimeout(()=>{
      const listBtnLbl=document.getElementById('ownerListBtnLabel');
      if(listBtnLbl){
        const step=OWNER_STEPS[grp.listState]||OWNER_STEPS['none'];
        listBtnLbl.textContent='📋 '+step.btn.replace('▶ ','').split(' ').slice(0,3).join(' ');
      }
    },60);
  }
}

function ownerNextStep(){
  const grp=g();
  const step=OWNER_STEPS[grp.listState]||OWNER_STEPS['none'];
  step.action();
  updateOwnerBtn();
}

function ownerReleaseEscrow(){
  const grp   = g();
  const myItems = Object.values(itemLists[currentGroupId] || {}).flat();
  const total   = myItems.filter(i => i.status === 'paid')
                         .reduce((s, i) => s + (i.price * i.qty), 0);

  pushSys(currentGroupId, '💸 Processing escrow release...');
  renderChat();

  midtransPayout({
    orderId:       grp.orderId || currentGroupId,
    travellerName: ME,
    amount:        total,
    onSuccess: function(result) {
      grp.listState = 'done';
      grp.status    = 'closed';
      pushSys(currentGroupId, '✅ Payout queued! Funds will appear in your bank account within 1 business day. Group complete 🎉');
      pushSys(currentGroupId, 'Reference: ' + (result.reference_no || 'N/A'));
      pushSys(currentGroupId, 'Owner — tap "📋 Start New Item List" if you want to run another round.');
      updateOwnerBtn();
      renderChat();
      showToast('💰 Payout processed! Ref: ' + (result.reference_no || 'N/A'));
    },
    onError: function(msg) {
      pushSys(currentGroupId, '❌ Payout failed: ' + msg + '. Please contact support.');
      renderChat();
      showToast('❌ Payout failed: ' + msg);
    }
  });
}

function checkLiveBAllDone(){
  const grp=groups.find(g=>g.id==='gLB');
  if(!grp)return;
  const members=grp.members.filter(m=>m!==grp.members[grp.ownerIdx]);
  const allDone=members.every(m=>{const s=(collectingStatus['gLB']||{})[m];return s&&(s.memberConfirm==='received'||s.memberConfirm==='denied');});
  if(allDone){
    grp.listState='escrow_release';
    pushSys('gLB','All members confirmed! Tap "💰 Release Escrow" to receive your payment 💰');
    updateOwnerBtn();
    renderChat();
  }
}

function ownerStartDistributing(){
  g().listState='collecting';g().status='collecting';
  pushSys(currentGroupId,'Owner has started distributing items! 📦 Each member will receive a proof photo when their item is handed over.');
  updateOwnerBtn();renderChat();
  showToast('📦 Distribution started! Send proof photos to each member in chat.');
}

function ownerSendProofToMember(memberId){
  // Use the hidden file input embedded in the collecting page UI
  window._proofTargetMember = memberId;
  document.getElementById('collectingProofInput').click();
}

function handleCollectingProof(input){
  const memberId = window._proofTargetMember;
  if(!memberId||!input.files||!input.files[0])return;
  const reader=new FileReader();
  reader.onload=ev=>{
    pushMsg(currentGroupId,ME,`📦 Proof of item for ${memberId}:`,ME_EMOJI);
    chats[currentGroupId].push({from:ME,img:ev.target.result,text:'',time:now()});

    if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
    if(!collectingStatus[currentGroupId][memberId])collectingStatus[currentGroupId][memberId]={};
    collectingStatus[currentGroupId][memberId].ownerMark='given';
    collectingStatus[currentGroupId][memberId].memberConfirm=null; // reset if resending
    pushSys(currentGroupId,`Owner sent proof to ${memberId}. Waiting for ${memberId} to confirm. ✅`);
    showToast(`✅ Proof sent to ${memberId}! Waiting for response...`);
    input.value='';
    window._proofTargetMember=null;
    showCollectingPage();
    renderChat();
    // Trigger live member response if applicable
    // Clear the per-member guard so response can re-fire on resend
    if(currentGroupId==='gLB'){
      const gLBgrp=groups.find(g=>g.id==='gLB');
      if(gLBgrp) delete gLBgrp['_resp_'+memberId];
      triggerLiveB_memberResponse(memberId);
    }
    if(currentGroupId==='gLA'){
      const gLAgrp=groups.find(g=>g.id==='gLA');
      if(gLAgrp) delete gLAgrp['_resp_'+memberId];
      triggerLiveA_memberResponse(memberId);
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function ownerOpenList(){
  const grp=g();
  if(grp.listState!=='none'&&grp.listState!=='done'){showToast('⚠️ Finish the current item list first.');return;}
  grp.listState='open';if(!itemLists[currentGroupId])itemLists[currentGroupId]={};
  pushSys(currentGroupId,'Owner opened an item list! Members — add your items now. 📋');
  updateOwnerBtn();renderChat();
  // Live B: simulate members adding items after a delay
  if(currentGroupId==='gLB') triggerLiveB_membersAddItems();
}

function triggerLiveB_membersAddItems(){
  const grp=groups.find(g=>g.id==='gLB');
  if(!grp||grp._triggered_add)return;
  grp._triggered_add=true;
  if(!itemLists['gLB'])itemLists['gLB']={};
  liveStep('gLB',2500,()=>{
    itemLists['gLB']['Dira']=[{name:'Stussy Basic Tee L Black',qty:2,status:'pending',price:null,deniedReason:null}];

    pushMsg('gLB','Dira',"Added my items! 2x Basic Tee in black 🙏",'👩');
  });
  liveStep('gLB',5000,()=>{
    itemLists['gLB']['Galih']=[
      {name:'Stussy 8 Ball Cap One Size Black',qty:1,status:'pending',price:null,deniedReason:null},
      {name:'Stussy Logo Hoodie M Grey',qty:1,status:'pending',price:null,deniedReason:null},
    ];
    pushMsg('gLB','Galih',"Added mine! Cap and hoodie 🧢",'👨');
    showToast('👥 Members have added their items!');
  });
}

function ownerCloseListAndPrice(){
  const items=itemLists[currentGroupId]||{};
  const memberCount=Object.keys(items).length;
  if(memberCount===0){showToast('⚠️ No members have added items yet.');return;}
  g().listState='pricing';
  pushSys(currentGroupId,'Owner closed the item list. Now setting prices for each member...');
  updateOwnerBtn();renderChat();
  showSetPricesPage();
}

function ownerSetStatus(status){
  g().listState=status;g().status=status;
  const msgs={buying:'Owner is now buying all items! 🛒',collecting:'Owner is distributing items to members. 📦'};
  pushSys(currentGroupId,msgs[status]||`Status: ${status}`);
  updateOwnerBtn();renderChat();
}

// ── COLLECTING ────────────────────────────────────────────────────────────────
function showCollectingPage(){
  const grp=g();
  const members=grp.members.filter(function(m){return m!==grp.members[grp.ownerIdx];});
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  var html='<div style="font-size:12px;color:var(--gray-text);margin-bottom:14px;line-height:1.6">Send a proof photo to each member when you hand over their items. Escrow releases after they confirm receipt.</div>';
  members.forEach(function(m){
    var cs=(collectingStatus[currentGroupId]||{})[m]||{};
    var ownerMark=cs.ownerMark||'not-given';
    var memberConfirm=cs.memberConfirm||null;
    var confirmBadge='';
    if(memberConfirm==='received') confirmBadge='<span style="font-size:11px;background:var(--green-bg);color:var(--green);padding:2px 8px;border-radius:8px;font-weight:600">✅ Confirmed</span>';
    else if(memberConfirm==='denied') confirmBadge='<span style="font-size:11px;background:#FFEBEE;color:var(--red);padding:2px 8px;border-radius:8px;font-weight:600">❌ Denied</span>';
    else if(ownerMark==='given') confirmBadge='<span style="font-size:11px;background:#FFF3E0;color:#E65100;padding:2px 8px;border-radius:8px;font-weight:600">⏳ Waiting</span>';
    html+='<div style="background:var(--gray-bg);border-radius:12px;padding:12px;margin-bottom:8px">';
    html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">';
    html+='<span style="font-size:20px">👤</span>';
    html+='<span style="flex:1;font-size:13px;font-weight:600">'+m+'</span>';
    html+=confirmBadge;
    html+='</div>';
    if(ownerMark!=='given'){
      // Use data attribute so no quote escaping needed
      html+='<button class="send-proof-btn" data-member="'+encodeURIComponent(m)+'" style="width:100%;padding:9px;background:var(--purple);color:white;border:none;border-radius:8px;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;cursor:pointer">📸 Send Proof Photo</button>';
    } else {
      html+='<div style="font-size:11px;color:var(--gray-text)">Proof sent ✓ — waiting for member to confirm in chat</div>';
      if(memberConfirm==='denied'){
        html+='<button class="send-proof-btn" data-member="'+encodeURIComponent(m)+'" style="width:100%;padding:8px;background:#FFEBEE;color:var(--red);border:none;border-radius:8px;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;cursor:pointer;margin-top:6px">📸 Resend Proof Photo</button>';
      }
    }
    html+='</div>';
  });
  document.getElementById('collectingBody').innerHTML=html;
  // Wire up proof buttons using event delegation (avoids inline onclick quote issues)
  document.getElementById('collectingBody').querySelectorAll('.send-proof-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var memberId=decodeURIComponent(btn.getAttribute('data-member'));
      ownerSendProofToMember(memberId);
    });
  });
  showPage('pgCollecting');
}

function toggleCollecting(mem){
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  if(!collectingStatus[currentGroupId][mem])collectingStatus[currentGroupId][mem]={};
  const cur=collectingStatus[currentGroupId][mem].ownerMark||'not-given';
  collectingStatus[currentGroupId][mem].ownerMark=cur==='given'?'not-given':'given';
  if(cur!=='given'){
    pushSys(currentGroupId,`Owner marked ${mem}'s items as given. Waiting for ${mem} to confirm.`);
  }
  showCollectingPage();
}

function submitCollecting(){
  const statuses=collectingStatus[currentGroupId]||{};
  const givenCount=Object.values(statuses).filter(s=>s&&s.ownerMark==='given').length;
  showToast(`✅ ${givenCount} member(s) marked as given. Waiting for their confirmation.`);
  showPage('pgChat');setTimeout(renderChat,100);
}

function toggleItemRcv(idx){
  if(!window._rcv)window._rcv={};
  if(!window._rcv[currentGroupId])window._rcv[currentGroupId]={};
  window._rcv[currentGroupId][idx]=!window._rcv[currentGroupId][idx];
  renderRcvChecklist(); // update only the checklist, not the whole chat
}

function renderRcvChecklist(){
  const cl=document.getElementById('rcvChecklist');
  const btn=document.getElementById('rcvConfirmBtn');
  const hint=document.getElementById('rcvHint');
  if(!cl)return;
  const myItems=(itemLists[currentGroupId]||{})[ME]||[];
  if(!window._rcv[currentGroupId])window._rcv[currentGroupId]={};
  const allChecked=myItems.length>0&&myItems.every((_,i)=>window._rcv[currentGroupId][i]);
  cl.innerHTML=myItems.map((item,i)=>{
    const chk=!!window._rcv[currentGroupId][i];
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.06);font-size:13px;cursor:pointer" onclick="toggleItemRcv(${i})">
      <div style="width:22px;height:22px;border-radius:6px;flex-shrink:0;border:2px solid ${chk?'var(--green)':'#ddd'};background:${chk?'var(--green)':'transparent'};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;transition:all 0.2s">${chk?'✓':''}</div>
      <span style="flex:1;${chk?'text-decoration:line-through;opacity:0.5':''}">${item.name} ×${item.qty}</span>
    </div>`;
  }).join('');
  if(btn){
    btn.style.background=allChecked?'var(--purple)':'#ddd';
    btn.style.color=allChecked?'white':'#999';
    btn.style.cursor=allChecked?'pointer':'not-allowed';
    btn.onclick=allChecked?markGiven:()=>showToast('Tick all items first');
  }
  if(hint)hint.style.display=allChecked?'none':'block';
}

function openDisputeSheet(){
  document.getElementById('ovDispute').classList.add('show');
}

function submitDispute(){
  const reason=document.getElementById('disputeReason').value.trim();
  const missing=document.getElementById('disputeMissing').value.trim();
  if(!reason){showToast('⚠️ Please describe the issue.');return;}
  closeOv('ovDispute');
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  collectingStatus[currentGroupId][ME]='disputed';
  pushMsg(currentGroupId,ME,`⚠️ I have an issue with my items. Missing/Wrong: ${missing||'see below'}. ${reason}`,ME_EMOJI);
  pushSys(currentGroupId,`${ME} submitted a dispute. Escrow held until resolved.`);
  showToast('⚠️ Dispute sent to owner.');
  renderChat();
}

function memberConfirmReceived(){
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  if(!collectingStatus[currentGroupId][ME])collectingStatus[currentGroupId][ME]={};
  collectingStatus[currentGroupId][ME].memberConfirm='received';
  pushSys(currentGroupId,`${ME} confirmed receipt of items ✅ — escrow payment released to owner.`);
  showToast('✅ Confirmed! Payment released to owner.');
  // Check if all members confirmed
  const grp=g();
  const members=grp.members.filter(m=>m!==grp.members[grp.ownerIdx]);
  const allDone=members.every(m=>{const s=(collectingStatus[currentGroupId]||{})[m];return s&&(s.memberConfirm==='received'||s.memberConfirm==='denied');});
  if(allDone){
    grp.listState='escrow_release';
    pushSys(currentGroupId,'All members have confirmed receipt! 🎉 Owner — tap Next Step to release escrow to your account.');
    updateOwnerBtn();
  }
  renderChat();
}

function memberDenyReceived(){
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  if(!collectingStatus[currentGroupId][ME])collectingStatus[currentGroupId][ME]={};
  collectingStatus[currentGroupId][ME].memberConfirm='denied';
  // Reset ownerMark so owner needs to resend proof
  collectingStatus[currentGroupId][ME].ownerMark='not-given';
  pushMsg(currentGroupId,ME,"I haven't received all my items yet — something may be missing or wrong. Please check! ❌",ME_EMOJI);
  pushSys(currentGroupId,`${ME} denied receipt. Owner — please check and resend proof via the Distribute Items page.`);
  showToast('⚠️ Reported to owner — they will resend proof.');
  renderChat();
}

function markGiven(){
  if(!collectingStatus[currentGroupId])collectingStatus[currentGroupId]={};
  if(!collectingStatus[currentGroupId][ME])collectingStatus[currentGroupId][ME]={};
  collectingStatus[currentGroupId][ME].memberConfirm='received';
  pushSys(currentGroupId,`${ME} confirmed receipt of all items ✅ — escrow payment released to owner.`);
  showToast('✅ Confirmed! Payment released to owner.');renderChat();
}

// ── KICK ──────────────────────────────────────────────────────────────────────
function openKickSheet(){
  const grp=g();
  const others=grp.members.filter((m,i)=>i!==grp.ownerIdx&&m!==ME);
  document.getElementById('kickMemberList').innerHTML=others.map(m=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--divider)">
      <span style="font-size:18px">👤</span><span style="flex:1;font-size:13px;font-weight:600">${m}</span>
      <button onclick="kickMember('${m}')" style="padding:7px 12px;background:var(--red);color:white;border:none;border-radius:8px;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;cursor:pointer">Remove</button>
    </div>`).join('');
  document.getElementById('ovKick').classList.add('show');
}

function kickMember(name){
  const grp=g();grp.members=grp.members.filter(m=>m!==name);
  if(itemLists[currentGroupId])delete itemLists[currentGroupId][name];
  pushSys(currentGroupId,`${name} was removed from the group by the owner.`);
  closeOv('ovKick');showToast(`🚫 ${name} removed.`);renderChat();openDetail(currentGroupId);
}

// ── CLOSE GROUP ───────────────────────────────────────────────────────────────
function ownerCloseGroup(){
  const grp=g();
  if(grp.listState!=='none'&&grp.listState!=='done'){showToast('⚠️ Cannot close group while item list is active.');return;}
  document.getElementById('ovCloseGroup').classList.add('show');
}

function confirmCloseGroup(){
  closeOv('ovCloseGroup');g().status='closed';
  pushSys(currentGroupId,'This group is now closed. No new members can join. Chat remains active. 🔒');
  showToast('🔒 Group closed.');renderChat();
}

// ── CREATE GROUP ──────────────────────────────────────────────────────────────
function previewBrandPhoto(input){if(!input.files||!input.files[0])return;const r=new FileReader();r.onload=e=>{const box=document.getElementById('brandPhotoBox');let img=box.querySelector('img');if(!img){img=document.createElement('img');img.style.cssText='width:100%;height:120px;object-fit:cover;border-radius:10px';box.appendChild(img);}img.src=e.target.result;document.getElementById('brandPhotoHint').style.display='none';};r.readAsDataURL(input.files[0]);}

async function submitCreateOrder(){
  const brand=document.getElementById('co-brand').value.trim();
  const country=document.getElementById('co-country').value;
  const cats=document.getElementById('co-categories').value.trim();
  const max=parseInt(document.getElementById('co-maxmembers').value)||5;
  const desc=document.getElementById('co-desc').value.trim();
  const deadline=document.getElementById('co-deadline').value;
  const autoH=parseInt(document.getElementById('co-autohours').value)||0;
  const link=document.getElementById('co-link').value.trim();
  if(!brand||!country||!desc||!deadline){showToast('⚠️ Please fill in Brand, Country, Deadline, and Rules.');return;}
  const newG={id:'g'+Date.now(),brand,country:'🌍 '+country,link,categories:cats||'General',maxMembers:max,members:[ME],ownerIdx:0,status:'open',listState:'none',deadline,autoHours:autoH,desc,joined:true,createdAt:'Today',orderId:'#CS'+String(groups.length+1).padStart(3,'0')};
  groups.unshift(newG);
  chats[newG.id]=[{from:'sys',text:`${ME} created this group for ${brand} (${country}) 🎉`}];

  ['co-brand','co-link','co-categories','co-maxmembers','co-deadline','co-autohours'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('co-country').value='';document.getElementById('co-desc').value='';showToast('✅ Group created!');
  currentGroupId=newG.id;
  switchListTab('my');
  // Brief delay then open the chat
  setTimeout(()=>openChat(newG.id), 100);
}

// ── INIT ──────────────────────────────────────────────────────────────────────

  // Fix G2 action button — only one price review button (not 2)
  // Already handled in item list card rendering

  // ── LIVE GROUP A — You as CUSTOMER, item list open, real-time simulation ──
  groups.push({
    id:'gLA', brand:'New Balance', country:'🇺🇸 USA', link:'https://www.newbalance.com',
    categories:'Shoes, Clothing', maxMembers:5,
    members:['Arif', ME, 'Wendi'], ownerIdx:0,
    status:'open', listState:'open', deadline:'2026-06-01', autoHours:0,
    desc:'1. New Balance USA items only\n2. Max 2 items per person\n3. Must pay within 24h of price set\n4. No returns after purchase',
    joined:true, createdAt:'Today', orderId:'#LIVE1',
    _live: true, _liveRole: 'customer'
  });


  chats['gLA']=[


    {from:'sys', text:'Arif created this group for New Balance USA 🇺🇸'},
    {from:'Arif', text:"Hey everyone! I'm heading to NB Boston next week. Add your items to the list 👟", time:'09.00', emoji:'👨'},
    {from:'Wendi', text:"Oh nice! I've been eyeing the 990v6 for ages 👀", time:'09.05', emoji:'🧑'},
    {from:'sys', text:'Arif opened an item list! Add your items now. 📋'},
  ];
  itemLists['gLA'] = {


    'Wendi': [{name:'New Balance 990v6 Grey Size 42', qty:1, status:'pending', price:null, deniedReason:null}],
  };

  // ── LIVE GROUP B — You as OWNER, item list open, members auto-add items ──
  groups.push({
    id:'gLB', brand:'Stüssy', country:'🇺🇸 USA', link:'https://www.stussy.com',
    categories:'Streetwear, Caps, Accessories', maxMembers:6,
    members:[ME, 'Dira', 'Galih'], ownerIdx:0,
    status:'open', listState:'open', deadline:'2026-06-05', autoHours:0,
    desc:'1. Stüssy USA items only\n2. Max 3 items per person\n3. No fake/replica items\n4. Pay within 48h',
    joined:true, createdAt:'Today', orderId:'#LIVE2',
    _live: true, _liveRole: 'owner'
  });


  chats['gLB']=[


    {from:'sys', text:'Kamu created this group for Stüssy USA 🇺🇸'},
    {from:ME, text:"Hi! Going to Stüssy LA next week. Add what you want — streetwear and caps only 🧢", time:'10.00', emoji:'😊'},
    {from:'Dira', text:"Awesome! Adding now 🙌", time:'10.05', emoji:'👩'},
    {from:'Galih', text:"Finally! I need that stock cap. Adding mine too", time:'10.08', emoji:'👨'},
    {from:'sys', text:'Kamu opened an item list! Members — add your items now. 📋'},
  ];
  itemLists['gLB'] = {};



  switchListTab('my');

  // ── LIVE SIMULATION ENGINE ────────────────────────────────────────────────────
  // These functions simulate real-time responses from other members/owners
  // triggered by user actions in live groups

  function liveStep(groupId, delayMs, fn) {
    setTimeout(() => {
      fn();
      if (currentGroupId === groupId) renderChat();
    }, delayMs);
  }

  // Called after ME submits items in gLA — owner auto-closes list after 4s and sets prices
  function triggerLiveA_afterSubmit() {
    const grp = groups.find(g => g.id === 'gLA');
    if (!grp || grp._triggered_submit) return;
    grp._triggered_submit = true;

    liveStep('gLA', 2000, () => {
      pushMsg('gLA', 'Arif', "Got it! Let me check prices on the NB website. I'll close the list now and get back to you with prices 🔍", '👨');
    });
    liveStep('gLA', 5000, () => {
      grp.listState = 'pricing';
      pushSys('gLA', 'Arif closed the item list. Setting prices now...');
      updateOwnerBtn();
    });
    liveStep('gLA', 9000, () => {
      const items = itemLists['gLA'];
      Object.values(items).forEach(mItems => mItems.forEach(i => {
        if (i.status === 'pending') { i.price = Math.floor(Math.random() * 500000) + 800000; i.status = 'price_set'; }
      }));
      grp.listState = 'price_review';
      pushSys('gLA', 'Arif set prices for all items. Check the item list below to review! 💰');
      updateOwnerBtn();
      showToast('💰 Owner set prices! Review below.');
    });
  }

  // Called when ME denies prices in gLA — Arif responds, negotiates, then reprices
  function triggerLiveA_afterDeny() {
    const grp = groups.find(g => g.id === 'gLA');
    if (!grp || grp._triggered_deny) return;
    grp._triggered_deny = true;

    liveStep('gLA', 1500, () => {
      pushMsg('gLA', 'Arif', "Hey! Let me check the price again 👀", '👨');
    });
    liveStep('gLA', 4000, () => {
      pushMsg('gLA', 'Arif', "You're right, I made an error — the price I quoted included shipping from the store to the hotel which is separate. The item price itself is lower. Let me reprice now!", '👨');
    });
    liveStep('gLA', 7000, () => {
      // Arif reprices MY items to a lower price
      const myItemsList = (itemLists['gLA']||{})[ME] || [];
      myItemsList.forEach(i => {
        if (i.status === 'price_denied') {
          // Set a fairer price (80% of original)
          i.price = Math.round((i.price || 900000) * 0.82 / 1000) * 1000;
          i.status = 'price_set';
        }
      });
      // Wendi's items stay accepted/paid
      grp.listState = 'price_review';
      pushSys('gLA', 'Arif updated your prices. Check the item list below to review! 💰');
      updateOwnerBtn();
      renderChat();
      showToast('💰 Arif repriced! Review below.');
    });
  }

  // Called after ME accepts & pays in gLA — owner auto-responds
  function triggerLiveA_afterPay() {
    const grp = groups.find(g => g.id === 'gLA');
    if (!grp || grp._triggered_pay) return;
    grp._triggered_pay = true;

    liveStep('gLA', 2000, () => {
      const wItems = (itemLists['gLA']['Wendi'] || []);
      wItems.forEach(i => { if (i.status === 'price_set' || i.status === 'accepted') { i.price = i.price || 950000; i.status = 'paid'; } });
      pushSys('gLA', 'Wendi paid to escrow ✅');
    });
    liveStep('gLA', 3500, () => {
      grp.listState = 'buying'; grp.status = 'buying';
      pushSys('gLA', '💰 All members paid! Arif is now buying. 🛒');
      updateOwnerBtn();
      showToast('🛒 Owner is buying your items!');
    });
    liveStep('gLA', 8000, () => {
      pushMsg('gLA', 'Arif', "Just bought everything at NB Boston! 🎉 Packing and sending via GoBox. Will share proof photos soon.", '👨');
      grp.listState = 'collecting'; grp.status = 'collecting';
      if (!collectingStatus['gLA']) collectingStatus['gLA'] = {};
      updateOwnerBtn();
    });
    // Arif sends proof to Wendi first
    liveStep('gLA', 11000, () => {
      collectingStatus['gLA']['Wendi'] = { ownerMark: 'given', memberConfirm: null };
      pushMsg('gLA', 'Arif', '📦 Wendi — your New Balance 990v6 is packed and sent!', '👨');
      chats['gLA'].push({ from:'Arif', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', text:'', time:now(), emoji:'👨' });


      pushSys('gLA', "Arif sent proof to Wendi. Waiting for Wendi to confirm.");
    });
    // Wendi confirms
    liveStep('gLA', 14000, () => {
      collectingStatus['gLA']['Wendi'].memberConfirm = 'received';
      pushMsg('gLA', 'Wendi', "Just received it! The colourway is even better in person 😍 Confirming now ✅", '🧑');
      pushSys('gLA', 'Wendi confirmed receipt ✅ — escrow released for Wendi.');
    });
    // Arif sends proof to ME
    liveStep('gLA', 17000, () => {
      collectingStatus['gLA'][ME] = { ownerMark: 'given', memberConfirm: null };
      pushMsg('gLA', 'Arif', '📦 Your Air Max 270 is on the way! Proof photo:', '👨');
      chats['gLA'].push({ from:'Arif', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', text:'', time:now(), emoji:'👨' });


      pushSys('gLA', `Arif sent proof to ${ME}. Please confirm receipt in the item list! 👇`);
      renderChat();
      showToast('📦 Your item is on the way! Confirm below.');
    });
  }

  // Called after ME submits prices in gLB — members auto-respond
  function triggerLiveB_afterPrices() {
    const grp = groups.find(g => g.id === 'gLB');
    if (!grp || grp._triggered_prices) return;
    grp._triggered_prices = true;

    // Dira accepts immediately
    liveStep('gLB', 2000, () => {
      pushMsg('gLB', 'Dira', "Prices look good to me! Accepting now 🙏", '👩');
      const dItems = itemLists['gLB']['Dira'] || [];
      dItems.forEach(i => { if (i.status === 'price_set') i.status = 'accepted'; });
    });
    liveStep('gLB', 3500, () => {
      const dItems = itemLists['gLB']['Dira'] || [];
      dItems.forEach(i => { if (i.status === 'accepted') i.status = 'paid'; });
      pushSys('gLB', 'Dira accepted prices and paid to escrow ✅');
      showToast('✅ Dira paid! Waiting for Galih...');
    });

    // Galih denies — starts a back-and-forth
    liveStep('gLB', 6000, () => {
      pushMsg('gLB', 'Galih', "Hey, the 8 Ball Cap price seems off — Rp 1.1M? On the Stüssy site it's USD $55 which is about Rp 870K 🤔", '👨');
      const gItems = itemLists['gLB']['Galih'] || [];
      gItems.forEach(i => {
        i.status = 'price_denied';
        i.deniedReason = 'Website shows USD $55 (~Rp 870K), not Rp 1.1M. Please recheck.';
      });
      // Revert to pricing state so YOU can reprice
      grp.listState = 'pricing';
      pushSys('gLB', 'Galih denied the prices. Owner — go to Set Prices to update and resend.');
      updateOwnerBtn();
      showToast('⚠️ Galih denied! Tap "✅ Send Prices" to reprice.');
    });
    liveStep('gLB', 8000, () => {
      // Galih elaborates in chat
      pushMsg('gLB', 'Galih', "I even checked on the app just now, USD $55 at today's rate is Rp 888K. Can you update?", '👨');
    });
    // NOTE: After this, YOU (the owner) need to:
    // 1. Tap "✅ Send Prices" in the owner toolbar
    // 2. Update Galih's cap price to Rp 888000
    // 3. Submit → Galih will auto-accept the new price (triggerLiveB_afterReprice)
  }

  function triggerLiveB_afterReprice() {
    // Called when owner submits repriced items — Galih now accepts
    const grp = groups.find(g => g.id === 'gLB');
    if (!grp || grp._triggered_reprice) return;
    const gItems = itemLists['gLB']['Galih'] || [];
    const hasRepricedItem = gItems.some(i => i.status === 'price_set');
    if (!hasRepricedItem) return;
    grp._triggered_reprice = true;

    liveStep('gLB', 2500, () => {
      pushMsg('gLB', 'Galih', "That's much better, thank you! Accepting now ✅", '👨');
      gItems.forEach(i => { if (i.status === 'price_set') i.status = 'accepted'; });
    });
    liveStep('gLB', 4000, () => {
      gItems.forEach(i => { if (i.status === 'accepted') i.status = 'paid'; });
      pushSys('gLB', 'Galih accepted the updated price and paid to escrow ✅');
      showToast('✅ Galih paid! All members done.');
      // Now check if all paid
      const allPaidLB = Object.values(itemLists['gLB']||{}).every(mi=>mi.every(i=>i.status==='paid'||i.status==='denied'));
      if (allPaidLB) triggerLiveB_afterAllPay();
    });
  }

  // Called when all gLB members pay — simulation complete
  function triggerLiveB_afterAllPay() {
    const grp = groups.find(g => g.id === 'gLB');
    if (!grp || grp._triggered_allpay) return;
    grp._triggered_allpay = true;
    liveStep('gLB', 2000, () => {
      grp.listState = 'buying'; grp.status = 'buying';
      pushSys('gLB', '💰 All members paid! You may now start buying. 🛒');
      updateOwnerBtn();
      showToast('🛒 All paid! Tap "▶ Start Distributing" when done buying.');
    });
  }

  // Called after owner sends proof to a specific member in gLB
  // Fires per-member so timing is relative to when proof was actually sent
  function triggerLiveB_memberResponse(memberId) {
    const grp = groups.find(g => g.id === 'gLB');
    if (!grp) return;
    const key = '_resp_' + memberId;
    if (grp[key]) return; // already triggered for this member
    grp[key] = true;

    if (memberId === 'Dira') {
      // Dira confirms after 3s
      liveStep('gLB', 3000, () => {
        if (!collectingStatus['gLB']) collectingStatus['gLB'] = {};
        if (!collectingStatus['gLB']['Dira']) collectingStatus['gLB']['Dira'] = {};
        pushMsg('gLB', 'Dira', "Just got my Stüssy tees! Both look amazing 🙌 Confirming now ✅", '👩');
        collectingStatus['gLB']['Dira'].memberConfirm = 'received';
        pushSys('gLB', 'Dira confirmed receipt ✅ — escrow released for Dira.');
        renderChat();
        showToast('✅ Dira confirmed receipt!');
      });
    } else if (memberId === 'Galih') {
      const grpLB = groups.find(g=>g.id==='gLB');
      // Check if this is a resend (Galih previously denied)
      const galihPrevDenied = (collectingStatus['gLB']||{})['Galih']?.memberConfirm === null
        && (collectingStatus['gLB']||{})['Galih']?.ownerMark === 'given'
        && grpLB?._galih_denied_once;

      if (galihPrevDenied) {
        // Second time — Galih confirms
        liveStep('gLB', 3000, () => {
          pushMsg('gLB', 'Galih', "Got the new package! The cap is here now 🧢 All good, confirming ✅", '👨');
          if (!collectingStatus['gLB']['Galih']) collectingStatus['gLB']['Galih'] = {};
          collectingStatus['gLB']['Galih'].memberConfirm = 'received';
          pushSys('gLB', 'Galih confirmed receipt ✅ — escrow released for Galih.');
          renderChat();
          showToast('✅ Galih confirmed receipt! All members done.');
          // Check if all done
          checkLiveBAllDone();
        });
      } else {
        // First time — Galih denies
        liveStep('gLB', 3000, () => {
          pushMsg('gLB', 'Galih', "Got the package but the 8 Ball Cap isn't here — only the hoodie 😕", '👨');
        });
        liveStep('gLB', 5000, () => {
          if (!collectingStatus['gLB']) collectingStatus['gLB'] = {};
          if (!collectingStatus['gLB']['Galih']) collectingStatus['gLB']['Galih'] = {};
          pushMsg('gLB', 'Galih', "Marking not received — cap is missing. Please resend!", '👨');
          collectingStatus['gLB']['Galih'].memberConfirm = 'denied';
          collectingStatus['gLB']['Galih'].ownerMark = 'not-given';
          if(grpLB) grpLB._galih_denied_once = true;
          pushSys('gLB', 'Galih denied receipt — cap missing. Owner — resend proof in Distribute Items.');
          renderChat();
          showToast('⚠️ Galih denied! Resend proof in Distribute Items page.');
        });
      }
    }
  }

  // Same for gLA — Wendi confirms, ME waits for user action
  function triggerLiveA_memberResponse(memberId) {
    const grp = groups.find(g => g.id === 'gLA');
    if (!grp) return;
    const key = '_resp_' + memberId;
    if (grp[key]) return;
    grp[key] = true;

    if (memberId === 'Wendi') {
      liveStep('gLA', 3000, () => {
        if (!collectingStatus['gLA']) collectingStatus['gLA'] = {};
        if (!collectingStatus['gLA']['Wendi']) collectingStatus['gLA']['Wendi'] = {};
        pushMsg('gLA', 'Wendi', "Just received my 990v6! The colourway is even better in person 😍 Confirming ✅", '🧑');
        collectingStatus['gLA']['Wendi'].memberConfirm = 'received';
        pushSys('gLA', 'Wendi confirmed receipt ✅ — escrow released for Wendi.');
        renderChat();
        showToast('✅ Wendi confirmed receipt!');
      });
    }
    // ME (user) responds themselves via the UI buttons
  }

  // Hook into existing functions to trigger live simulations


// ════════════════════════════════════════════════════════
// REPORT SYSTEM — completely self-contained
// ════════════════════════════════════════════════════════
var _rType = '', _rName = '', _rReason = null;

var _rReasons = {
  member: [
    {id:'abusive',     icon:'💬', label:'Abusive in chat',       desc:'Member was rude or threatening'},
    {id:'unresponsive',icon:'🚫', label:'Unresponsive',          desc:'Member stopped responding'},
    {id:'false_claim', icon:'❌', label:'False receipt claim',   desc:'Member falsely claimed item not received'},
    {id:'harassment',  icon:'⚠️', label:'Harassment',            desc:'Member is harassing other members'},
    {id:'other',       icon:'✏️', label:'Other',                 desc:'Describe the issue below'},
  ],
  owner: [
    {id:'not_distributed',icon:'📦', label:'Item not distributed', desc:'Owner did not send items or proof'},
    {id:'unresponsive',   icon:'🚫', label:'Unresponsive',          desc:'Owner stopped responding'},
    {id:'unfair_close',   icon:'❌', label:'Closed group unfairly', desc:'Group was closed without reason'},
    {id:'fraud',          icon:'⚠️', label:'Suspected fraud',       desc:'Owner may be acting fraudulently'},
    {id:'other',          icon:'✏️', label:'Other',                 desc:'Describe the issue below'},
  ],
};

function openReport(type, name) {
  _rType   = type;
  _rName   = name;
  _rReason = null;

  var modal = document.getElementById('reportModal');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  document.getElementById('rModalTarget').textContent = 'Reporting: ' + name;
  document.getElementById('rModalError').style.display = 'none';
  document.getElementById('rModalOtherWrap').style.display = 'none';

  var reasons = _rReasons[type] || _rReasons.owner;
  document.getElementById('rModalChoices').innerHTML = reasons.map(function(r) {
    return '<div id="rrc-' + r.id + '" onclick="rModalSelect(\'' + r.id + '\')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px solid #e8e8e8;border-radius:12px;cursor:pointer;background:#fff">'
      + '<span style="font-size:20px">' + r.icon + '</span>'
      + '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#1a1a1a">' + r.label + '</div>'
      + '<div style="font-size:11px;color:#9e9e9e;margin-top:1px">' + r.desc + '</div></div>'
      + '<div id="rrc-chk-' + r.id + '" style="width:20px;height:20px;border-radius:50%;border:2px solid #e0e0e0;flex-shrink:0"></div>'
      + '</div>';
  }).join('');
}

function rModalSelect(id) {
  _rReason = id;
  var reasons = _rReasons[_rType] || _rReasons.owner;
  reasons.forEach(function(r) {
    var el  = document.getElementById('rrc-' + r.id);
    var chk = document.getElementById('rrc-chk-' + r.id);
    if (!el || !chk) return;
    if (r.id === id) {
      el.style.borderColor  = '#e53935';
      el.style.background   = '#fff5f5';
      chk.style.background  = '#e53935';
      chk.style.borderColor = '#e53935';
    } else {
      el.style.borderColor  = '#e8e8e8';
      el.style.background   = '#fff';
      chk.style.background  = '#fff';
      chk.style.borderColor = '#e0e0e0';
    }
  });
  document.getElementById('rModalError').style.display = 'none';
  document.getElementById('rModalOtherWrap').style.display = (id === 'other') ? 'block' : 'none';
}

function rModalClose() {
  document.getElementById('reportModal').style.display = 'none';
  document.body.style.overflow = '';
}

function rModalSubmit() {
  if (!_rReason) {
    document.getElementById('rModalError').style.display = 'block';
    return;
  }
  if (_rReason === 'other') {
    var desc = document.getElementById('rModalDesc').value.trim();
    if (!desc) {
      document.getElementById('rModalError').textContent = 'Please describe the issue.';
      document.getElementById('rModalError').style.display = 'block';
      return;
    }
  }

  var description = _rReason === 'other'
    ? document.getElementById('rModalDesc').value.trim()
    : '';

  var submitBtn = document.getElementById('rModalSubmit') || null;

  /*
   * ════════════════════════════════════════════════════════════════
   * BACKEND INTEGRATION — POST /api/reports
   * ════════════════════════════════════════════════════════════════
   * Table: reports
   * Columns:
   *   reporter_id     — from auth token
   *   reported_type   — 'member' | 'owner'
   *   reported_name   — _rName (member or owner name string)
   *   reason          — _rReason
   *   description     — free text if reason = 'other'
   *   context_type    — 'group'
   *   context_id      — currentGroupId
   *   status          — 'pending' (default)
   * ════════════════════════════════════════════════════════════════
   */
  var token = localStorage.getItem('jastip_token');
  fetch(API + '/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      reported_type: _rType,
      reported_id:   null,
      reported_name: _rName,
      reason:        _rReason,
      description:   description,
      context_type:  'group',
      context_id:    currentGroupId || null
    })
  }).then(function() {
    rModalClose();
    showToast('✅ Report submitted. Our team will review it shortly.');
  }).catch(function() {
    // Backend not yet implemented — show success anyway for demo
    rModalClose();
    showToast('✅ Report submitted. Our team will review it shortly.');
  });
}

// Close modal when clicking backdrop
document.getElementById('reportModal').addEventListener('click', function(e) {
  if (e.target === this) rModalClose();
});
// ════════════════════════════════════════════════════════
