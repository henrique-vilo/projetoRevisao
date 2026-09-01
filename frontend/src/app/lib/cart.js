const CART_KEY = "everett-carrinho";

export function getCart() {
  if (typeof window === "undefined") return [];

  try {
    const salvo = localStorage.getItem(CART_KEY);

    if (!salvo) return [];

    const carrinho = JSON.parse(salvo);

    return Array.isArray(carrinho) ? carrinho : [];
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
    return [];
  }
}

export function saveCart(carrinho) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(carrinho));

  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(produto) {
  const carrinho = getCart();

  const existente = carrinho.find(
    (item) => String(item.id) === String(produto.id)
  );

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      imagem: produto.imagem,
      quantidade: 1,
    });
  }

  saveCart(carrinho);

  return carrinho;
}

export function removeFromCart(id) {
  const carrinho = getCart().filter(
    (item) => String(item.id) !== String(id)
  );

  saveCart(carrinho);

  return carrinho;
}

export function increaseQuantity(id) {
  const carrinho = getCart();

  const produto = carrinho.find(
    (item) => String(item.id) === String(id)
  );

  if (produto) {
    produto.quantidade += 1;
  }

  saveCart(carrinho);

  return carrinho;
}

export function decreaseQuantity(id) {
  const carrinho = getCart();

  const produto = carrinho.find(
    (item) => String(item.id) === String(id)
  );

  if (produto) {
    produto.quantidade -= 1;

    if (produto.quantidade <= 0) {
      return removeFromCart(id);
    }
  }

  saveCart(carrinho);

  return carrinho;
}

export function clearCart() {
  saveCart([]);

  return [];
}

export function getCartQuantity() {
  return getCart().reduce(
    (total, produto) => total + produto.quantidade,
    0
  );
}

export function getCartTotal() {
  return getCart().reduce(
    (total, produto) =>
      total + Number(produto.preco) * produto.quantidade,
    0
  );
}