import "./Header.css";
import "bootstrap-icons/font/bootstrap-icons.css";
export default function Header() {

    return(
        <>
 <nav className="navbar navbar-expand-lg navbar-custom">
    <div className="snow">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span> 
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
  <div className="container-fluid">

    {/* Logo */}
    <a className="navbar-brand" href="#">
      <img
        src="/everettlogo.png"
        alt="Everett"
        width={85}
        height={70}
      />
    </a>

    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>

    <div className="collapse navbar-collapse" id="navbarSupportedContent">

      {/* Menu */}
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link active" href="#">
            Novidades
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            Masculino
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">
            Feminino
          </a>
        </li>

      </ul>

      {/* Barra de pesquisa */}
      <form className="search-form mx-auto" role="search">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>

          <input
            className="form-control search-input"
            type="search"
            placeholder="Buscar"
          />
        </div>
      </form>

    </div>
  </div>
</nav>

        </>
    )

}