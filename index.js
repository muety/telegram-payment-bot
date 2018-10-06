const Telegraf = require('telegraf')
const { Markup } = Telegraf

const app = new Telegraf('<YOUR_BOT_TOKEN_HERE>')
const PAYMENT_TOKEN = '<YOUR_STRIPE_API_TOKEN_HERE>'

const products = [
  {
    name: 'Nuka-Cola Quantum',
    price: 27.99,
    description: 'Ice-cold, radioactive Nuka-Cola. Very rare!',
    photoUrl: 'http://vignette2.wikia.nocookie.net/fallout/images/e/e6/Fallout4_Nuka_Cola_Quantum.png'
  },
  {
    name: 'Iguana on a Stick',
    price: 3.99,
    description: 'The wasteland\'s most famous delicacy.',
    photoUrl: 'https://vignette2.wikia.nocookie.net/fallout/images/b/b9/Iguana_on_a_stick.png'
  }
]

function createInvoice (product) {
  return {
    provider_token: PAYMENT_TOKEN,
    start_parameter: 'foo',
    title: product.name,
    description: product.description,
    currency: 'EUR',
    photo_url: product.photoUrl,
    is_flexible: false,
    need_shipping_address: false,
    prices: [{ label: product.name, amount: Math.trunc(product.price * 100) }],
    payload: {}
  }
}

// Start command
app.command('start', ({ reply }) => reply('Welcome, nice to meet you! I can sell you various products. Just ask.'))

// Show offer
app.hears(/^what.*/i, ({ replyWithMarkdown }) => replyWithMarkdown(`
You want to know what I have to offer? Sure!

${products.reduce((acc, p) => {
    return (acc += `*${p.name}* - ${p.price} €\n`)
  }, '')}    
What do you want?`,
Markup.keyboard(products.map(p => p.name)).oneTime().resize().extra()
))

// Order product
products.forEach(p => {
  app.hears(p.name, (ctx) => {
    console.log(`${ctx.from.first_name} is about to buy a ${p.name}.`)
    ctx.replyWithInvoice(createInvoice(p))
  })
})

// Handle payment callbacks
app.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
app.on('successful_payment', (ctx) => {
  console.log(`${ctx.from.first_name} (${ctx.from.username}) just payed ${ctx.message.successful_payment.total_amount / 100} €.`)
})

app.startPolling()
