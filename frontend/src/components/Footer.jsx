import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row">

          <div className="col-md-4 mb-4">
            <h4 className="fw-bold">EVERETT</h4>

            <p>
              Estilo, qualidade e personalidade para todos os momentos.
            </p>
          </div>

          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3">NAVEGAÇÃO</h6>

            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/" className="text-decoration-none">
                  Início
                </a>
              </li>

              <li className="mb-2">
                <a href="/produtos" className="text-decoration-none">
                  Produtos
                </a>
              </li>

              <li className="mb-2">
                <a href="/sobre" className="text-decoration-none">
                  Sobre nós
                </a>
              </li>

              <li>
                <a href="/contato" className="text-decoration-none">
                  Suporte
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-4">
            <h6 className="fw-bold mb-3">CONTATO</h6>

            <p className="mb-2">
              contato@everett.com
            </p>

            <p className="mb-0">
              (11) 99999-9999
            </p>
          </div>

        </div>

        <hr />

        <div className="text-center pt-3">
          <p className="mb-0">
            © 2026 Everett. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}