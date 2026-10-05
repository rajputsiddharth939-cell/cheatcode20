create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text,
  state text,
  pincode text,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  delivery_charge numeric default 0,
  total_amount numeric not null,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  payment_status text default 'pending',
  order_status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_payment_status_idx on public.orders(payment_status);

alter table public.orders enable row level security;
