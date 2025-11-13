# Implementation Examples

## Example 1: Basic Client Tool - Show Message

This example shows how to create a client tool that displays a message on screen.

### In pages/index.tsx:

```typescript
const clientTools = {
  show_message: async ({ message, duration = 5000 }: { message: string; duration?: number }) => {
    // Update UI state
    setToolState((prev: any) => ({ ...prev, message }));
    
    // Play tool-specific video
    videoManager.playToolVideo('show_message');
    
    // Auto-hide message after duration
    setTimeout(() => {
      setToolState((prev: any) => ({ ...prev, message: null }));
    }, duration);
    
    return `Message displayed: ${message}`;
  },
};
```

### In ElevenLabs Agent Configuration:

**Tool Name:** `show_message`

**Description:** Display a message on the kiosk screen

**Parameters:**
- `message` (string, required): The message to display
- `duration` (number, optional): How long to show the message in milliseconds

**System Prompt Addition:**
```
You can display messages on screen using the show_message tool. 
Use it to provide visual feedback to users.
```

## Example 2: Product Scan Tool

### Add to clientTools:

```typescript
const clientTools = {
  scan_product: async ({ barcode }: { barcode: string }) => {
    try {
      // Play scanning animation video
      videoManager.playToolVideo('scan_product');
      
      // Fetch product info from your API
      const response = await fetch(`/api/products/${barcode}`);
      const product = await response.json();
      
      // Update UI with product info
      setToolState((prev: any) => ({
        ...prev,
        currentProduct: product,
        showProductCard: true,
      }));
      
      return `Product found: ${product.name}, Price: ${product.price}`;
    } catch (error) {
      return `Product not found for barcode: ${barcode}`;
    }
  },
};
```

### Add UI Component:

```typescript
{/* Product Card Display */}
{toolState.showProductCard && toolState.currentProduct && (
  <div 
    className="absolute top-32 right-8 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96"
    style={{ borderColor: config.theme.primary, borderWidth: 3 }}
  >
    <h3 className="text-2xl font-bold mb-2">{toolState.currentProduct.name}</h3>
    <p className="text-lg mb-4">{toolState.currentProduct.description}</p>
    <div 
      className="text-3xl font-bold"
      style={{ color: config.theme.primary }}
    >
      ${toolState.currentProduct.price}
    </div>
  </div>
)}
```

## Example 3: Multiple Video States

### Setup different videos for different actions:

In `config/booths.ts`:

```typescript
videos: {
  idle: [
    '/videos/healthygo/idle1.mp4',
    '/videos/healthygo/idle2.mp4',
  ],
  talking: '/videos/healthygo/talking.mp4',
  thinking: '/videos/healthygo/thinking.mp4',
  
  // Tool-specific videos
  tool_scan_product: '/videos/healthygo/scanning.mp4',
  tool_show_nutrition: '/videos/healthygo/nutrition_analysis.mp4',
  tool_checkout: '/videos/healthygo/checkout.mp4',
  tool_thank_you: '/videos/healthygo/thank_you.mp4',
}
```

### Use in client tools:

```typescript
const clientTools = {
  show_nutrition: async ({ product_id }: { product_id: string }) => {
    videoManager.playToolVideo('show_nutrition');
    // ... rest of logic
  },
  
  checkout: async ({ cart_items }: { cart_items: any[] }) => {
    videoManager.playToolVideo('checkout');
    // ... checkout logic
  },
  
  thank_you: async () => {
    videoManager.playToolVideo('thank_you');
    return "Thank you for visiting HealthyGo!";
  },
};
```

## Example 4: Multi-step Interaction Flow

### Create a shopping flow:

```typescript
const clientTools = {
  // Step 1: Show product categories
  show_categories: async ({ categories }: { categories: string[] }) => {
    videoManager.playToolVideo('show_categories');
    setToolState((prev: any) => ({
      ...prev,
      currentView: 'categories',
      categories,
    }));
    return `Showing ${categories.length} categories`;
  },
  
  // Step 2: Show products in category
  show_products: async ({ category, products }: { category: string; products: any[] }) => {
    videoManager.playToolVideo('show_products');
    setToolState((prev: any) => ({
      ...prev,
      currentView: 'products',
      currentCategory: category,
      products,
    }));
    return `Showing ${products.length} products in ${category}`;
  },
  
  // Step 3: Add to cart
  add_to_cart: async ({ product_id, quantity }: { product_id: string; quantity: number }) => {
    videoManager.playToolVideo('add_to_cart');
    setToolState((prev: any) => ({
      ...prev,
      cart: [...(prev.cart || []), { product_id, quantity }],
    }));
    return `Added ${quantity} item(s) to cart`;
  },
  
  // Step 4: Show cart
  show_cart: async () => {
    setToolState((prev: any) => ({
      ...prev,
      currentView: 'cart',
    }));
    return `Showing cart with ${toolState.cart?.length || 0} items`;
  },
};
```

## Example 5: Creating a New Booth (Jago Banking)

### 1. Create video assets:

```bash
mkdir -p public/videos/jago
mkdir -p public/logos
```

Add videos:
- `public/videos/jago/idle1.mp4`
- `public/videos/jago/talking.mp4`
- `public/videos/jago/checking_balance.mp4`
- `public/videos/jago/transfer_money.mp4`
- `public/logos/jago.png`

### 2. Update config/booths.ts:

```typescript
export const jagoConfig: BoothConfig = {
  id: 'jago',
  name: 'Jago',
  theme: {
    primary: '#0066cc', // Jago blue
    secondary: '#0052a3',
    accent: '#3399ff',
    dark: '#003d7a',
  },
  logo: '/logos/jago.png',
  videos: {
    idle: ['/videos/jago/idle1.mp4'],
    talking: '/videos/jago/talking.mp4',
    tool_check_balance: '/videos/jago/checking_balance.mp4',
    tool_transfer: '/videos/jago/transfer_money.mp4',
  },
};
```

### 3. Create custom client tools:

```typescript
const clientTools = {
  check_balance: async ({ account_number }: { account_number: string }) => {
    videoManager.playToolVideo('check_balance');
    
    // Mock API call
    const balance = '50,000,000';
    
    setToolState((prev: any) => ({
      ...prev,
      showBalance: true,
      balance,
    }));
    
    return `Account balance: Rp ${balance}`;
  },
  
  transfer_money: async ({ 
    to_account, 
    amount 
  }: { 
    to_account: string; 
    amount: number 
  }) => {
    videoManager.playToolVideo('transfer');
    
    setToolState((prev: any) => ({
      ...prev,
      showTransferConfirmation: true,
      transferDetails: { to_account, amount },
    }));
    
    return `Transfer of Rp ${amount.toLocaleString()} initiated`;
  },
};
```

### 4. Update .env.local:

```env
NEXT_PUBLIC_BOOTH_TYPE=jago
ELEVENLABS_AGENT_ID=your_jago_agent_id
```

### 5. Configure ElevenLabs Agent:

**System Prompt:**
```
You are a helpful banking assistant at a Jago kiosk. 
You can help users with:
- Checking account balance
- Transferring money
- Viewing transaction history

Always be professional, clear, and secure. Ask for account verification when needed.
```

## Example 6: Advanced UI Components

### Custom Notification System:

```typescript
// Add to your page
const [notifications, setNotifications] = useState<Array<{
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}>>([]);

const addNotification = (message: string, type: 'info' | 'success' | 'error') => {
  const id = Date.now().toString();
  setNotifications(prev => [...prev, { id, message, type }]);
  
  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, 5000);
};

// In clientTools:
const clientTools = {
  notify: async ({ message, type = 'info' }: { message: string; type?: string }) => {
    addNotification(message, type as any);
    return `Notification sent: ${message}`;
  },
};

// In render:
{notifications.map(notification => (
  <div 
    key={notification.id}
    className="absolute top-32 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl animate-slide-in"
    style={{
      backgroundColor: 
        notification.type === 'success' ? '#10b981' :
        notification.type === 'error' ? '#ef4444' :
        config.theme.primary,
      color: 'white',
    }}
  >
    {notification.message}
  </div>
))}
```

## Example 7: Session Management

### Track conversation sessions:

```typescript
const [sessionData, setSessionData] = useState({
  startTime: null as Date | null,
  interactions: 0,
  toolsUsed: [] as string[],
});

// Update clientTools to track usage:
const clientTools = {
  scan_product: async (params: any) => {
    // Track tool usage
    setSessionData(prev => ({
      ...prev,
      interactions: prev.interactions + 1,
      toolsUsed: [...prev.toolsUsed, 'scan_product'],
    }));
    
    videoManager.playToolVideo('scan_product');
    // ... rest of logic
  },
};

// On conversation start:
const startConversation = async () => {
  setSessionData({
    startTime: new Date(),
    interactions: 0,
    toolsUsed: [],
  });
  // ... rest of start logic
};

// On conversation end:
const endConversation = async () => {
  // Log session data
  console.log('Session summary:', {
    duration: sessionData.startTime 
      ? (Date.now() - sessionData.startTime.getTime()) / 1000 
      : 0,
    interactions: sessionData.interactions,
    toolsUsed: sessionData.toolsUsed,
  });
  
  // ... rest of end logic
};
```

## Tips & Best Practices

### 1. Video Optimization
- Keep videos under 10MB for faster loading
- Use H.264 codec for best browser compatibility
- Resolution: 1920x1080 (Full HD) is sufficient
- Frame rate: 30fps is smooth enough

### 2. Client Tool Design
- Keep tool responses concise
- Always return a string describing the action
- Handle errors gracefully
- Use try-catch blocks

### 3. UI State Management
- Use TypeScript interfaces for tool state
- Clear state when conversation ends
- Provide visual feedback for all actions

### 4. Testing
- Test with different microphones
- Verify video switching is smooth
- Check performance on target hardware
- Test network interruptions

### 5. Production Deployment
- Minify videos
- Enable caching
- Monitor error logs
- Set up analytics

