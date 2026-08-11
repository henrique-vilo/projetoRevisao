"use client";

import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <main>
       <div
  id="carouselExampleAutoplaying"
  className="carousel slide"
  data-bs-ride="carousel"
>
  <div className="carousel-inner">
    <div className="carousel-item active">
      <img src="/imagem1.png" className="d-block w-100" alt="..." />
    </div>
    <div className="carousel-item">
      <img src="/imagem2.png" className="d-block w-100" alt="..." />
    </div>
    <div className="carousel-item">
      <img src="/imagem3.png" className="d-block w-100" alt="..." />
    </div>
  </div>
  <button
    className="carousel-control-prev"
    type="button"
    data-bs-target="#carouselExampleAutoplaying"
    data-bs-slide="prev"
  >
    <span className="carousel-control-prev-icon" aria-hidden="true" />
    <span className="visually-hidden">Previous</span>
  </button>
  <button
    className="carousel-control-next"
    type="button"
    data-bs-target="#carouselExampleAutoplaying"
    data-bs-slide="next"
  >
    <span className="carousel-control-next-icon" aria-hidden="true" />
    <span className="visually-hidden">Next</span>
  </button>
</div>

      </main>
    </>
  );
}
