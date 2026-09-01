import "./Footer.css";
import { FaInstagram, FaTiktok, FaPinterest, FaXTwitter, FaFacebook } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="footer py-5">
      <div className="container text-center">
        {/* Topo / Marca */}
        <div className="brand-section mb-4">
          <p className="brand-text-top mb-1">A gente se encontra na</p>
          <h1 className="brand-name fw-bold mb-2">EVERETT</h1>
          <p className="brand-description mb-4">
            Estilo, qualidade e personalidade para todos os momentos.
          </p>
          <div className="social-icons d-flex justify-content-center gap-3">
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://www.tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a 
              href="https://www.pinterest.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              aria-label="Pinterest"
            >
              <FaPinterest />
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              aria-label="Twitter"
            >
              <FaXTwitter />
            </a>
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
              aria-label="Facebook"
            >
              <FaFacebook />
            </a>
          </div>
        </div>

        <hr className="my-5" />

        {/* Colunas do Footer */}
        <div className="row text-start footer-columns">
          {/* Categoria: Roupas */}
          <div className="col-6 col-md-3 mb-4">
            <h6 className="column-header fw-bold mb-3">VESTUÁRIO</h6>
            <ul className="list-unstyled">
              <li><a href="/produtos?categoria=roupas-masculinas" className="footer-link">Roupas Masculinas</a></li>
              <li><a href="/produtos?categoria=roupas-femininas" className="footer-link">Roupas Femininas</a></li>
              <li><a href="/produtos?categoria=roupas-infantis" className="footer-link">Roupas Infantis</a></li>
            </ul>
          </div>

          {/* Categoria: Coleções & Estilos */}
          <div className="col-6 col-md-3 mb-4">
            <h6 className="column-header fw-bold mb-3">COLEÇÕES</h6>
            <ul className="list-unstyled">
              <li><a href="/produtos?categoria=acessorios" className="footer-link">Acessórios</a></li>
              <li><a href="/produtos?categoria=moda-esportiva" className="footer-link">Moda Esportiva</a></li>
              <li><a href="/produtos?categoria=inverno" className="footer-link">Inverno</a></li>
            </ul>
          </div>

          {/* Navegação Institucional */}
          <div className="col-6 col-md-3 mb-4">
            <h6 className="column-header fw-bold mb-3">NAVEGAÇÃO</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="footer-link">Início</a></li>
              <li><a href="/produtos" className="footer-link">Produtos</a></li>
              <li><a href="/sobre" className="footer-link">Sobre nós</a></li>
              <li><a href="/contato" className="footer-link">Suporte</a></li>
            </ul>
          </div>

          {/* Contato & Missão */}
          <div className="col-6 col-md-3 mb-4">
            <h6 className="column-header fw-bold mb-3">CONTATO</h6>
            <p className="contact-info mb-1">
              <a href="mailto:contato@everett.com" className="footer-link p-0">contato@everett.com</a>
            </p>
            <p className="contact-info mb-3">
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="footer-link p-0">(11) 99999-9999</a>
            </p>

            <h6 className="column-header fw-bold mb-2">MISSÃO</h6>
            <p className="mission-text mb-0">
              Entregar estilo e qualidade com personalidade.
            </p>
          </div>
        </div>

        {/* Direitos Reservados */}
        <div className="copyright-section mt-5">
          <p className="mb-0 copyright-text">
            © 2026 Everett. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}