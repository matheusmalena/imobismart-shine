

## Plan: Create Thank You / Payment Success Page

### What
A modern, celebratory "Thank You" page at `/payment-success` that users land on after completing a purchase via Cakto.

### Design
Centered layout with:
- Animated checkmark icon (green circle with check, using framer-motion for a scale-in effect)
- Confetti-style decorative elements via CSS gradients/dots
- "Obrigado pela compra!" heading (`text-3xl font-bold`)
- Subtitle confirming plan activation
- "Acessar Plataforma" button navigating to `/dashboard`
- Subtle background gradient or decorative blur circles for a modern feel

### Steps

**Step 1: Create `src/pages/PaymentSuccess.tsx`**
- Modern centered card with animated check icon (framer-motion `motion.div` with scale animation)
- Decorative background blur circles (absolute positioned, gradient colors)
- Title: "Obrigado pela sua compra!"
- Description: "Seu plano foi ativado com sucesso. Aproveite todos os recursos disponíveis."
- Primary CTA button: "Acessar Plataforma" → navigates to `/dashboard`
- Secondary link: "Voltar ao início" → navigates to `/`

**Step 2: Add route in `src/App.tsx`**
- Add `<Route path="/payment-success" element={<PaymentSuccess />} />`

