# Reacción en cadena

**Energía de activación, metaestabilidad y propagación con fichas de dominó.** Preprint de Bruno Loiacono, estudiante de Física (Universidad de Buenos Aires).

Una torre de dominó quieta que se desmorona con un empujoncito reúne tres ideas centrales de la química: la energía de activación, la metaestabilidad y la reacción en cadena. El paper las formula con un modelo de fichas que caen si la energía recibida alcanza su barrera. La cadena se sostiene si y solo si η·Q ≥ Ea, una red tolera las barreras irregulares mucho mejor que una fila, y en una ficha real la barrera es apenas el 1,4 % de la energía que libera. También discute dónde falla la metáfora: romper enlaces no libera energía.

- 📄 **[PDF](paper/paper.pdf)**
- 🌐 **[Versión web](https://loiaconobruno.github.io/chain-reaction/)**

> Preprint, documento de trabajo sin revisión por pares.

## Cómo se genera

`paper/paper.tex` es la única fuente. En cada push, GitHub Actions compila el PDF con TeX Live y arma la versión web (`index.html`). Para regenerar a mano las figuras, chequear las referencias o rearmar la página:

```bash
node paper/figuras/generar.js     # figuras y todas las cifras de la sección 4
python3 paper/verificar_bib.py    # cada referencia contra Crossref, Open Library o su URL
python3 paper/web.py              # index.html a partir del .tex
```

## Cómo citarlo

```bibtex
@misc{loiacono2026cadena,
  author       = {Loiacono, Bruno},
  title        = {Reacción en cadena: energía de activación, metaestabilidad y propagación con fichas de dominó},
  year         = {2026},
  howpublished = {Preprint, documento de trabajo sin revisión por pares},
  url          = {https://github.com/LoiaconoBruno/chain-reaction}
}
```

## Licencia

El texto, las figuras y el PDF están bajo [CC BY 4.0](LICENSE-CC-BY-4.0.txt). Los scripts que generan las figuras y la página están bajo MIT. El detalle está en [LICENSE](LICENSE).
