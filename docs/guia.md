# Reacción en cadena: paper de uso y guía de la idea

## Resumen

Este documento acompaña a **Chain Reaction**, una página interactiva que usa fichas de dominó como metáfora de tres conceptos centrales de la química y la física: la **energía de activación** (el empujoncito que hace falta para que algo empiece), la **metaestabilidad** (algo que está quieto pero no a salvo) y la **reacción en cadena** (cada pieza que cae libera energía suficiente para tirar a la siguiente). La página también muestra dónde falla la metáfora, para no reforzar el malentendido más común de la química escolar: que romper enlaces libera energía.

La primera parte es un paper de uso: parámetros, ejemplo resuelto con los números de la herramienta, cómo leer los resultados y sus límites. La segunda es una guía de la idea, que recorre la historia y la física de esos tres conceptos: la ecuación de Arrhenius (1889) y la teoría del estado de transición de Eyring, Evans y Polanyi (1935); los catalizadores desde Berzelius y Ostwald hasta Haber y Bosch; la metaestabilidad del diamante, el agua sobreenfriada y el vidrio; las reacciones en cadena de Bodenstein, Nernst, Semenov y Hinshelwood; la mecánica de las fichas de dominó según Shaw, McLachlan y Whitehead; y las cadenas que aparecen fuera de la química: el impulso nervioso de Hodgkin y Huxley, las epidemias de Kermack y McKendrick, la percolación de Broadbent y Hammersley y la criticalidad autoorganizada de Bak, Tang y Wiesenfeld.

## Parte I. Paper de uso

### 1. Qué es la herramienta

Chain Reaction es una página estática sin dependencias que se abre desde la [demo en vivo](https://loiaconobruno.github.io/chain-reaction/) o con doble clic en `index.html`. Es una herramienta didáctica y conceptual: muestra cómo se comporta la energía en un proceso con umbral, no cómo se fabrica nada.

La página tiene cuatro zonas:

1. **Parámetros:** geometría, energías, eficiencia, empujón, variabilidad y catalizador, con los botones Empujar y Reiniciar, y una pista que dice si la cadena puede seguir.
2. **Fichas:** las fichas dibujadas, que caen paso a paso, con las estadísticas del resultado.
3. **Perfil de energía de una ficha:** el diagrama clásico de energía contra coordenada de reacción.
4. **Dónde falla la metáfora:** tres advertencias sobre lo que el modelo no representa.

La lógica está en `src/reaccion.js`, sin acceso al DOM. Los tests se corren con `npm test` (Node 18 o más nuevo).

### 2. Instalación

```bash
git clone https://github.com/LoiaconoBruno/chain-reaction.git
cd chain-reaction
npm test
```

Después se abre `index.html` con doble clic.

### 3. Parámetros

| Control | Rango | Qué representa |
|---|---|---|
| Geometría | Fila · Red | En la fila, la energía va solo hacia adelante (24 fichas). En la red, se reparte en cuatro direcciones (25 × 15 = 375 fichas) |
| Energía de activación (Ea) | 0,5 a 12 | La barrera: cuánta energía necesita recibir una ficha para caer |
| Energía que libera cada ficha (Q) | 1 a 20 | Lo que entrega al caer |
| Fracción que llega a la vecina (η) | 0 a 1 | Eficiencia de la transferencia; el resto se pierde |
| Empujón inicial | 0 a 15 | Energía que recibe la primera ficha (en la red, la del centro) |
| Variabilidad de Ea | 0 a 0,5 | Cuánto varía la barrera de ficha a ficha (±50 % como máximo) |
| Catalizador | sí / no | Baja todas las barreras a la mitad |

Al cambiar de geometría, los parámetros vuelven a valores de base pensados para ese modo: en la fila, Ea = 5, Q = 8, η = 0,7 y empujón 6; en la red, igual salvo Ea = 1,2.

### 4. Resultados

- **Fichas caídas:** cuántas cayeron sobre el total.
- **Pasos:** cuántas "rondas" duró la cadena. En cada paso caen todas las fichas que alcanzaron su barrera.
- **Energía liberada:** fichas caídas por Q.
- **Resultado:** "Cadena completa", "Se cortó" o "No arrancó".

La **pista** de los parámetros adelanta el resultado antes de empujar: dice cuánto le llega a la ficha siguiente y lo compara con la barrera.

### 5. El perfil de energía

El gráfico de la derecha dibuja una sola ficha como una reacción química: los **reactivos** (la ficha parada) a una altura Q, una **barrera** de altura Ea por encima de los reactivos, y los **productos** (la ficha caída) a altura 0. La diferencia entre reactivos y productos, Q, es la energía liberada. La altura de la barrera, Ea, es lo que hay que poner para que la ficha caiga. Con catalizador, el gráfico muestra la barrera original punteada y la nueva, de la mitad de altura.

### 6. Ejemplo resuelto

1. **Estado inicial.** Fila de dominó, Ea = 5, Q = 8, η = 0,7, empujón 6. La pista dice: "Llega 5,6 a la ficha siguiente y la barrera es 5. La cadena puede seguir." La cuenta es η · Q = 0,7 · 8 = 5,6 ≥ 5.
2. **Empujar.** El empujón (6) supera la barrera de la primera ficha (5): cae. Libera 8 y le pasa 5,6 a la segunda, que también cae, y así sucesivamente. Resultado: **Cadena completa**, **24 pasos** (una ficha por paso), energía liberada **192** (24 · 8).
3. **Subir la barrera.** Con Ea = 6, la primera ficha cae (el empujón 6 alcanza justo), pero a la segunda le llegan 5,6 < 6. Resultado: **Se cortó**, con una sola ficha caída.
4. **Catalizador.** Marcando "Catalizador", la barrera baja a 3. Al empujar, vuelve la **Cadena completa**. En el perfil de energía aparece la barrera original punteada.
5. **Red.** Al cambiar a "Red", la barrera de base es 1,2 y la energía de cada ficha se reparte en cuatro: a cada vecina le llega 0,7 · 8 / 4 = **1,4** ≥ 1,2. Al empujar, la reacción se expande desde el centro como un rombo y caen las **375 fichas en 20 pasos**: la ficha del centro está en la posición (12, 7), y la más lejana, en una esquina, está a 12 + 7 = 19 pasos de distancia, más el paso inicial.

### 7. Otros experimentos con números

Con los mismos parámetros de base, la herramienta da:

| Situación | Fichas caídas | Pasos | Lectura |
|---|---|---|---|
| Fila, empujón 4,5 | 0 | 0 | Metaestable: sin empujón suficiente no pasa nada |
| Fila, variabilidad 0,1 | 24 | 24 | Las barreras varían entre 4,5 y 5,5; todas por debajo de 5,6 |
| Fila, variabilidad 0,2 | 3 | 3 | Alguna barrera supera 5,6 y la cadena se corta ahí |
| Red, Ea = 1,4 | 375 | 20 | Justo en el umbral: llega exactamente 1,4 |
| Red, Ea = 1,5 | 1 | 1 | Cae el centro y la cadena muere |
| Red, Ea = 1,3, variabilidad 0,2 | 375 | 24 | Cae todo, pero más lento |
| Red, Ea = 1,3, variabilidad 0,3 | 375 | 26 | Cae todo, todavía más lento |

La comparación entre la fila y la red con variabilidad es una de las lecciones más interesantes (sección 18): una fila se corta en el primer eslabón débil; una red rodea los puntos débiles, porque una ficha con barrera alta puede acumular energía de **varias** vecinas caídas.

### 8. Cómo leer los resultados

- **La condición de la fila** es una desigualdad simple: la cadena se sostiene si η · Q ≥ Ea. Lo que cada ficha entrega a la siguiente tiene que alcanzar la barrera. La función `seSostieneEnFila` del código la evalúa.
- **El empujón** solo decide si la primera ficha cae. Después, la cadena se sostiene sola o no, independientemente del empujón. Por eso un empujón enorme no salva una cadena con η · Q < Ea.
- **La red** tiene una condición parecida, η · Q / 4 ≥ Ea, para que la cadena salga del centro. Pero, una vez en marcha, las fichas pueden recibir energía de varias vecinas, así que tolera barreras irregulares mejor que la fila.
- **El catalizador** no cambia Q ni η: solo baja la barrera. No hace que se libere más energía; hace que la cadena arranque y se sostenga más fácil.

#### 8.1 Preguntas frecuentes

**¿Por qué la energía liberada en la fila es 192 y no 192 más el empujón?** Porque la estadística cuenta solo lo que liberan las fichas al caer (caídas · Q). El empujón es energía que se pone, no que se libera.

**¿Por qué en la red los bordes "pierden" energía?** Porque una ficha del borde reparte η · Q / 4 a cada lado, incluso hacia afuera, donde no hay ficha. Es una simplificación: la energía que sale de la red se pierde, como el calor que una reacción entrega al entorno.

**¿Qué significa η en química?** No hay un equivalente exacto. Representa qué fracción de la energía liberada por una molécula que reacciona llega efectivamente a activar a otra. En una reacción real, esa energía se reparte como calor entre muchas moléculas y parte se pierde hacia el recipiente. η es la manera más simple de representar que no toda la energía liberada sirve para propagar.

**¿Por qué la variabilidad es "repetible"?** Porque se genera con un generador pseudoaleatorio con semilla fija. La misma configuración da siempre las mismas barreras, lo que permite comparar resultados en clase.

**¿Hay un equivalente químico de la ficha que suma energía de varias vecinas?** Sí: el calor. Una porción de mezcla rodeada de varias zonas que ya reaccionaron recibe calor de todas ellas y se calienta más que una que tiene una sola vecina caliente. Por eso los frentes reales rodean los obstáculos y por eso, en la herramienta, la red tolera mucho mejor que la fila las fichas con barrera alta. La diferencia es que en la herramienta la energía recibida se acumula para siempre, mientras que el calor real se disipa con el tiempo si no alcanza para activar la reacción.

**¿Por qué una ficha caída no recibe más energía?** Porque ya está en el estado de productos. En la simulación, las fichas caídas se saltean al repartir energía. En química, las moléculas que ya reaccionaron también pueden absorber calor, pero no vuelven a liberar la misma energía: la reacción ocurre una sola vez por molécula.

### 9. Limitaciones

- Es una metáfora, no una simulación química: no hay temperatura, difusión de calor ni cinética real.
- La regla de reparto de energía es una simplificación elegida para que el umbral se vea claro.
- No hay unidades: los números son relativos.
- El catalizador siempre baja la barrera a la mitad exacta.

## Parte II. Guía de la idea

### 10. La idea: una torre de dominó

La idea original era una imagen: una torre de fichas de dominó, quieta, que con un empujoncito se desmorona y libera mucha más energía de la que hizo falta para empezar. La imagen captura algo que los químicos explican con tres conceptos:

1. **Energía de activación:** casi todo lo que puede liberar energía necesita primero que se le ponga un poco. Una ficha parada tiene energía guardada (está alta), pero para caer tiene que inclinarse primero, levantando un poco su centro de masa.
2. **Metaestabilidad:** algo que podría liberar energía pero no lo hace, porque está atrapado detrás de una barrera. La torre quieta no es estable en el sentido de "no tiene a dónde ir"; es estable solo en el sentido de "no se mueve si nadie la toca".
3. **Reacción en cadena:** cuando la energía que libera una pieza alcanza para activar a la siguiente, el proceso se sostiene solo.

En el pizarrón esos conceptos son abstractos. Con fichas que caen o no caen según una barrera que se puede mover, el umbral se ve en segundos. Esta guía cuenta de dónde vienen esos conceptos, qué dicen sobre ellos los químicos y físicos que los formularon, y hasta dónde llega la metáfora.

### 11. La física de una ficha

#### 11.1 Energía potencial y centro de masa

Una ficha de dominó parada tiene su centro de masa a una altura h/2, la mitad de su altura. Acostada, su centro de masa está a una altura de la mitad de su espesor, mucho más abajo. La diferencia, multiplicada por mg, es la energía que libera al caer: es la Q de la herramienta.

Pero para pasar de parada a acostada, la ficha tiene que inclinarse, y al inclinarse **sube** su centro de masa hasta que queda justo sobre el borde de apoyo. En ese punto, la diagonal de la ficha está vertical, y el centro de masa está a una altura igual a la mitad de la diagonal: √(h² + e²)/2, con e el espesor. Esa subida, multiplicada por mg, es la energía de activación: la Ea de la herramienta. Para una ficha típica de 48 × 24 × 7,5 mm, la diagonal de la cara lateral mide unos 48,6 mm, así que la subida del centro de masa es de unos 0,3 mm, mientras que la caída total es de unos 20 mm. La barrera es menos del 2 % de la energía liberada. Por eso basta un soplido para tirar una ficha bien parada.

#### 11.2 Por qué una fila se cae

En una fila, cada ficha al caer golpea a la siguiente, y la energía que le transfiere tiene que superar esa pequeña barrera. Como la barrera es mínima y la energía liberada es grande, la condición η · Q ≥ Ea se cumple con holgura incluso si se pierde mucha energía en el choque. La cadena se sostiene sola.

D. E. Shaw estudió la mecánica de una fila de dominó en 1978 (*American Journal of Physics*, 46, 640–642). Robert McLachlan y colaboradores calcularon la velocidad con que se propaga la caída en *Falling dominoes* (*SIAM Review*, 25, 403–404, 1983), y Johannes van Leeuwen revisó el problema con detalle en 2010 (*American Journal of Physics*, 78, 721–727). Un resultado notable es que la velocidad de propagación alcanza un valor estacionario que depende de la separación y del tamaño de las fichas, no de cómo empezó la cadena: igual que en la herramienta, después del primer empujón la cadena "olvida" cómo arrancó.

#### 11.3 Whitehead y la amplificación

En 1983, Lorne Whitehead publicó en el *American Journal of Physics* (51, 182) una nota breve sobre una variante: una fila en la que cada ficha es 1,5 veces más grande que la anterior. Como la barrera de cada ficha es pequeña comparada con la energía que libera la anterior, se puede crecer de tamaño en cada paso. Whitehead mostró que con 13 fichas, empezando por una de 5 mm, la última podía ser de más de un metro y que la energía liberada por la última era unas dos mil millones de veces mayor que la que hizo falta para tirar la primera. Esa amplificación es la versión mecánica de lo que hace una reacción en cadena: liberar energía guardada, en cantidades cada vez mayores, a partir de un disparo mínimo. Agregar ese modo a la herramienta está entre sus próximos pasos.

### 12. La energía de activación en química

#### 12.1 Arrhenius, 1889

En 1889, Svante Arrhenius estudió cómo la temperatura acelera la inversión de la sacarosa en medio ácido (*Zeitschrift für physikalische Chemie*, 4, 226–248). Encontró que la velocidad de reacción crecía con la temperatura de una manera muy precisa, y propuso que solo las moléculas con energía suficiente, por encima de un umbral, podían reaccionar. La fracción de moléculas con esa energía, según la distribución de Boltzmann, es proporcional a e^(−Ea/RT). La **ecuación de Arrhenius** quedó así:

$$ k = A · e^(−Ea / RT) $$

donde k es la constante de velocidad, A un factor de frecuencia, R la constante de los gases y T la temperatura absoluta. Ea es la **energía de activación**. Arrhenius recibió el Premio Nobel de Química en 1903, por su teoría de la disociación electrolítica.

La ecuación tiene una consecuencia práctica conocida por cualquiera que cocine: muchas reacciones duplican su velocidad con unos 10 °C más de temperatura. Esa "regla" es solo aproximada, pero muestra cuán sensible es la velocidad a la barrera: un cambio chico en la fracción e^(−Ea/RT) cambia mucho el ritmo.

#### 12.2 El estado de transición: Eyring, Evans y Polanyi

En 1935, Henry Eyring (*Journal of Chemical Physics*, 3, 107–115) y, de manera independiente, Meredith Gwynne Evans y Michael Polanyi (*Transactions of the Faraday Society*, 31, 875–894) formularon la **teoría del estado de transición**. Las moléculas que reaccionan pasan por una configuración intermedia, el **complejo activado** o estado de transición, que es el punto más alto del camino de menor energía entre reactivos y productos: un punto de silla en la superficie de energía potencial. La energía de activación es la altura de ese punto respecto de los reactivos.

El perfil de energía de la herramienta es exactamente ese diagrama: reactivos, subida hasta la barrera, bajada hasta los productos. La ficha "inclinada justo sobre su borde" es el estado de transición.

#### 12.3 Kramers: cruzar la barrera con ruido

En 1940, Hendrik Kramers (*Physica*, 7, 284–304) trató el cruce de la barrera como un problema de física estadística: una partícula en un pozo, sacudida por el ruido térmico y frenada por la fricción, que de vez en cuando junta energía suficiente para escapar. Su resultado refina la ecuación de Arrhenius y muestra cómo la fricción con el entorno modifica la velocidad de escape. Es la base de cómo hoy se piensa el plegamiento de proteínas, la nucleación de cristales o los saltos de un átomo en una superficie.

La herramienta no tiene temperatura ni ruido: sus fichas solo caen si alguien les da energía. En una reacción química real, la "mano" que empuja es la agitación térmica, que sacude todas las moléculas todo el tiempo.

### 13. Los catalizadores

#### 13.1 Berzelius y Ostwald

En 1835, Jöns Jacob Berzelius acuñó la palabra **catálisis** para describir sustancias que aceleran reacciones sin consumirse. Wilhelm Ostwald dio la definición moderna en 1894: un catalizador es una sustancia que cambia la velocidad de una reacción sin aparecer en los productos y sin modificar el equilibrio. Ostwald recibió el Nobel de Química en 1909 por su trabajo sobre catálisis, equilibrios y velocidades de reacción.

La clave es que un catalizador **no cambia la energía que se libera**, solo la barrera. Ofrece un camino alternativo, con un estado de transición más bajo. En la herramienta, el catalizador baja Ea a la mitad y deja Q intacto: la energía liberada por la cadena completa es la misma, 192, con o sin catalizador.

#### 13.2 Catalizadores que cambiaron el mundo

Paul Sabatier (Nobel 1912) desarrolló la hidrogenación catalítica con metales finamente divididos, la base de la industria de los aceites. Fritz Haber y Carl Bosch, entre 1909 y 1913, desarrollaron la síntesis de amoníaco a partir del nitrógeno del aire con un catalizador de hierro: el proceso Haber-Bosch, que hoy produce los fertilizantes de los que depende alrededor de la mitad de la producción mundial de alimentos. Vaclav Smil contó esa historia en *Enriching the Earth* (2001). Gerhard Ertl recibió el Nobel de Química en 2007 por explicar, átomo por átomo, cómo funciona la catálisis en superficies, incluido el mecanismo de Haber-Bosch.

#### 13.3 Las enzimas

Las enzimas son los catalizadores de la vida. Bajan las barreras de las reacciones bioquímicas de tal manera que procesos que en agua tardarían millones de años ocurren en milisegundos. Richard Wolfenden y Mark Snider calcularon en 2001 (*Accounts of Chemical Research*, 34, 938–945) que algunas enzimas aceleran sus reacciones por factores de 10¹⁷. Linus Pauling propuso en 1948 que las enzimas funcionan uniéndose con más fuerza al estado de transición que a los reactivos, lo que estabiliza la cima de la barrera y la baja. Es la imagen exacta del catalizador de la herramienta.

### 14. La metaestabilidad

#### 14.1 Estable, inestable y metaestable

Un sistema está en **equilibrio estable** si, al perturbarlo un poco, vuelve a su estado. Está en **equilibrio inestable** si cualquier perturbación lo aleja (como el universo de Einstein, o una ficha perfectamente equilibrada sobre su borde). Está en un estado **metaestable** si vuelve ante perturbaciones chicas pero no ante perturbaciones grandes, porque existe otro estado de menor energía detrás de una barrera.

La ficha parada es metaestable. La torre de la idea, también. En la herramienta, la metaestabilidad se ve cuando el empujón no alcanza: la primera ficha recibe 4,5, menos que su barrera de 5, y no pasa nada. Hay 192 unidades de energía guardadas en la fila, pero ninguna se libera. Uno de los tests verifica exactamente esto.

#### 14.2 El diamante

El ejemplo más famoso de metaestabilidad es el diamante. A presión y temperatura ambiente, la forma más estable del carbono es el grafito; el diamante tiene un poco más de energía. Termodinámicamente, todo diamante debería convertirse en grafito. No lo hace porque la barrera para reorganizar su red cristalina es enorme. "Un diamante es para siempre" es, en rigor, "un diamante es metaestable con una barrera tan alta que la conversión a temperatura ambiente tardaría muchísimo más que la edad del universo".

#### 14.3 El agua sobreenfriada y la nucleación

El agua muy pura puede enfriarse por debajo de 0 °C sin congelarse: queda **sobreenfriada**. Para que se forme hielo, hace falta un núcleo, un pequeño cristal inicial, y formarlo cuesta energía (hay que crear una superficie entre el hielo y el agua). Esa es la barrera. Una vez que aparece un núcleo, el congelamiento se propaga como una cadena por todo el líquido. Josiah Willard Gibbs sentó las bases termodinámicas de la nucleación en *On the Equilibrium of Heterogeneous Substances* (1876–1878), y Max Volmer y Albert Weber (1926) y Richard Becker y Werner Döring (1935) desarrollaron la teoría clásica de la nucleación. Es una reacción en cadena sin fichas: un núcleo activa al líquido vecino, que se congela y libera calor latente, y el frente avanza.

Ostwald formuló en 1897 una regla empírica relacionada: cuando un sistema sale de un estado metaestable, no suele ir directamente al estado más estable, sino al metaestable más cercano. La **regla de las etapas de Ostwald** explica por qué muchas sustancias cristalizan primero en formas que después se transforman.

#### 14.4 El vidrio

Un vidrio es un líquido que se enfrió tan rápido que sus moléculas no tuvieron tiempo de ordenarse en un cristal y quedaron atrapadas en una configuración desordenada. Es un estado metaestable, o más precisamente, fuera del equilibrio: si se esperara lo suficiente, cristalizaría. Philip W. Anderson escribió en 1995 en *Science* (267, 1615) que la naturaleza del vidrio y de la transición vítrea era probablemente el problema sin resolver más profundo e interesante de la física del estado sólido. Las barreras en un vidrio no son una sola, como en la ficha, sino un paisaje enorme de pozos y colinas: la variabilidad de Ea de la herramienta es una versión mínima de ese paisaje.

### 15. Dónde falla la metáfora: romper enlaces no libera energía

#### 15.1 El malentendido

La herramienta dedica una tarjeta a señalar dónde falla la metáfora. El primer punto es el más importante: **romper un enlace químico siempre cuesta energía; formar uno siempre la libera**. La energía que se libera en una reacción exotérmica viene de que los enlaces que se forman en los productos son, en conjunto, más fuertes que los que se rompen en los reactivos.

Muchos estudiantes, e incluso libros de texto, dicen cosas como "la energía está guardada en los enlaces del ATP" o "al romperse el enlace se libera la energía". Es una idea tan persistente que tiene su propia literatura en investigación educativa. Hong Kwen Boo la documentó en estudiantes de química en 1998 (*Journal of Research in Science Teaching*, 35, 569–581), y William Galley la llamó "un error conceptual persistente" en el *Journal of Chemical Education* (81, 523–525, 2004). En el caso del ATP, lo que libera energía no es romper el enlace fosfato sino el conjunto de la reacción de hidrólisis, en la que se forman enlaces y se estabilizan los productos en agua.

#### 15.2 Cómo usar la metáfora sin reforzar el error

En la herramienta, la ficha parada tiene energía guardada porque está **alta**, y la libera al bajar. Eso puede sugerir que la energía de una molécula está "en" algo que se rompe. La lectura correcta es otra: la ficha parada es la configuración de **reactivos**, la ficha caída es la de **productos**, y Q es la diferencia de energía entre ambas configuraciones. La barrera Ea no es "el enlace que se rompe" sino el costo de pasar por la configuración intermedia.

Un enlace débil en una molécula explica por qué la reacción **arranca** fácil (barrera baja), no **de dónde** sale la energía (la diferencia entre reactivos y productos). Es la distinción entre cinética (qué tan rápido, qué tan fácil empieza) y termodinámica (cuánta energía se libera, hacia dónde va el equilibrio).

#### 15.3 Las otras dos fallas

La herramienta señala dos fallas más. Una detonación química no avanza "de arriba hacia abajo" como una fila, sino como un frente que se propaga en todas direcciones: por eso existe el modo red. Y las moléculas no se reparten la energía de manera prolija con una fracción η fija: la energía liberada se convierte en calor, se difunde y se reparte entre muchísimas moléculas. El modelo es una caricatura para ver el umbral.

#### 15.4 Termodinámica contra cinética

La herramienta separa dos números que la química también separa, y conviene nombrarlos con precisión.

**Q, la termodinámica.** Cuánta energía se libera al pasar de reactivos a productos. En química, la magnitud relevante a presión constante es el cambio de entalpía, ΔH, y para decidir si una reacción puede ocurrir espontáneamente, el cambio de energía libre de Gibbs, ΔG = ΔH − TΔS. Germain Hess mostró en 1840 que el calor de una reacción no depende del camino: es la diferencia entre el estado inicial y el final. Por eso un catalizador, que cambia el camino, no cambia Q.

**Ea, la cinética.** Cuán difícil es empezar. No depende de los extremos sino del camino: de la altura del estado de transición. Dos reacciones con el mismo ΔH pueden tener barreras muy distintas, y una reacción muy exotérmica puede ser lentísima (el diamante que se convierte en grafito, la combustión de la madera a temperatura ambiente).

La consecuencia práctica es que **"puede pasar" no es lo mismo que "pasa"**. La madera y el oxígeno del aire tienen mucha más energía juntos que el dióxido de carbono y el agua en que se convertirían; la reacción es favorable. Pero sin una llama que supere la barrera, una mesa de madera dura siglos. La torre de dominó de la idea es exactamente eso: un sistema con mucha energía disponible y una barrera chica que la custodia.

### 16. Las reacciones en cadena en química

#### 16.1 Bodenstein y el cloro

En 1913, Max Bodenstein estudió la reacción entre hidrógeno y cloro iluminada con luz, y encontró algo desconcertante: por cada fotón absorbido reaccionaban hasta un millón de moléculas (*Zeitschrift für physikalische Chemie*, 85, 329–397). Un fotón no podía aportar energía para tanto. Bodenstein propuso que la reacción procedía en **cadena**: el fotón produce una especie muy reactiva, que reacciona y produce otra especie reactiva, que reacciona y produce otra, y así miles de veces. Walther Nernst identificó en 1918 los eslabones: átomos de cloro y de hidrógeno libres que se regeneran en cada paso.

La estructura de la cadena tiene tres etapas, que la herramienta reproduce: **iniciación** (el empujón, el fotón), **propagación** (cada ficha activa a la siguiente) y **terminación** (la cadena se corta cuando la energía que llega no alcanza, o cuando dos especies reactivas se encuentran y se anulan).

#### 16.2 Semenov y Hinshelwood: las cadenas ramificadas

Nikolai Semenov, en Leningrado, y Cyril Hinshelwood, en Oxford, estudiaron en los años veinte y treinta reacciones en las que cada eslabón produce **más de una** especie reactiva. Esas cadenas se **ramifican**, y el número de especies activas crece exponencialmente: la reacción pasa de lenta a explosiva al cruzar ciertos límites de presión y temperatura. Semenov resumió la teoría en *Chemical Kinetics and Chain Reactions* (1935), y ambos recibieron el Premio Nobel de Química en 1956.

El modo red de la herramienta se parece a una cadena ramificada: cada ficha que cae puede activar a varias vecinas, y el número de fichas que caen por paso crece (hasta que la red se termina). En la fila, cada ficha activa una sola: es una cadena no ramificada.

#### 16.3 La historia de los explosivos, en una línea

La idea original mencionaba la historia de Ascanio Sobrero, que en 1847 sintetizó la nitroglicerina en Turín y advirtió sobre su peligrosidad, y de Alfred Nobel, que en 1867 patentó la dinamita, una forma mucho más segura de manipularla. La historia es un ejemplo de manual de la diferencia entre termodinámica y cinética: la energía liberada no cambiaba; lo que Nobel logró fue **subir la barrera** para el manejo cotidiano sin impedir que se pudiera activar a propósito. Es el catalizador al revés. La herramienta muestra el concepto con fichas y deja la química de esas sustancias fuera de su alcance, a propósito.

### 17. La reacción en cadena nuclear

El concepto de reacción en cadena saltó de la química a la física en los años treinta. En 1933, Leo Szilard imaginó que, si existiera un elemento que al ser golpeado por un neutrón liberara dos neutrones, se podría sostener una reacción en cadena nuclear. En diciembre de 1938, Otto Hahn y Fritz Strassmann observaron la fisión del uranio, y Lise Meitner y Otto Frisch la interpretaron físicamente pocas semanas después (*Nature*, 143, 239–240, 1939). La fisión libera neutrones, y esos neutrones pueden producir nuevas fisiones.

La condición para que la cadena se sostenga se escribe con el **factor de multiplicación** k: el número medio de fisiones que produce cada fisión. Si k < 1, la cadena se apaga; si k = 1, se sostiene a ritmo constante (**criticidad**); si k > 1, crece. Es la misma desigualdad de la fila, η · Q ≥ Ea, escrita de otra manera: lo que cada eslabón pasa al siguiente tiene que alcanzar para activarlo. El 2 de diciembre de 1942, el equipo de Enrico Fermi logró en Chicago la primera reacción en cadena nuclear controlada, en la pila CP-1, ajustando k a un valor apenas mayor que 1 con barras de control que absorbían neutrones. Las barras de control hacen lo contrario de un catalizador: bajan η.

### 18. Cadenas fuera de la química

#### 18.1 El impulso nervioso

Una neurona transmite señales a lo largo de su axón como una fila de dominó. La membrana del axón está "cargada": mantiene una diferencia de concentración de iones gracias a bombas que gastan energía, como alguien que para las fichas una por una. Cuando un tramo de la membrana se despolariza más allá de un **umbral**, se abren canales que dejan pasar iones de sodio, el tramo se despolariza del todo y esa corriente despolariza el tramo vecino, que cruza su umbral, y así sucesivamente. El impulso viaja sin perder intensidad porque cada tramo regenera la señal con su propia energía guardada.

Alan Hodgkin y Andrew Huxley midieron y modelaron este proceso en el axón gigante del calamar y publicaron en 1952 el modelo matemático que lleva su nombre (*Journal of Physiology*, 117, 500–544). Recibieron el Nobel de Fisiología o Medicina en 1963. El modelo tiene todo lo de la herramienta: umbral (Ea), energía liberada (la corriente de sodio), propagación (cada tramo activa al siguiente) y, además, algo que la herramienta no tiene: un **período refractario** durante el cual el tramo no puede volver a dispararse, lo que impide que la señal vuelva hacia atrás. Una fila de fichas también tiene período refractario: hasta que alguien las vuelva a parar.

#### 18.2 Epidemias

Una epidemia es una reacción en cadena entre personas. William Kermack y Anderson McKendrick publicaron en 1927 el modelo matemático clásico (*Proceedings of the Royal Society A*, 115, 700–721), del que sale el **número reproductivo básico** R₀: el número medio de personas que contagia cada infectado en una población susceptible. Si R₀ > 1, la epidemia crece; si R₀ < 1, se apaga. Es otra vez la misma desigualdad. Las vacunas actúan como el contrario de un catalizador: suben la barrera de las "fichas" vacunadas o las sacan de la red, y si la fracción vacunada supera 1 − 1/R₀, la cadena no puede sostenerse (inmunidad de rebaño).

#### 18.3 Percolación

¿Cuántas fichas pueden faltar en una red antes de que la cadena no pueda atravesarla? Simon Broadbent y John Hammersley plantearon en 1957 una pregunta parecida sobre cómo un fluido atraviesa un medio poroso (*Mathematical Proceedings of the Cambridge Philosophical Society*, 53, 629–641) y fundaron la teoría de la **percolación**. En una red cuadrada en la que cada sitio está "activo" con probabilidad p, existe un umbral crítico, p_c ≈ 0,593, por encima del cual aparece un camino que la cruza de lado a lado. Dietrich Stauffer y Amnon Aharony escribieron el texto de referencia, *Introduction to Percolation Theory* (1994).

La variabilidad de la herramienta en modo red es un problema de percolación con un giro: las fichas con barrera alta no están "ausentes", sino que necesitan energía de más de una vecina. Por eso la red con variabilidad 0,3 todavía cae entera, en 26 pasos en vez de 20: el frente rodea las fichas difíciles y las tira después, cuando ya cayeron varias de sus vecinas. En la fila, en cambio, la primera ficha difícil corta todo. La redundancia de la red la hace robusta.

#### 18.4 Avalanchas y criticalidad autoorganizada

En 1987, Per Bak, Chao Tang y Kurt Wiesenfeld propusieron un modelo de pila de arena (*Physical Review Letters*, 59, 381–384): se agregan granos uno por uno a una red, y cuando un sitio acumula demasiados, se "derrumba" y reparte granos a sus cuatro vecinos, que pueden derrumbarse a su vez. Es casi el modo red de la herramienta, con una diferencia: la energía se acumula lentamente desde afuera. Bak y colaboradores encontraron que el sistema se organiza solo en un estado crítico, en el que las avalanchas tienen todos los tamaños, sin escala característica. Lo llamaron **criticalidad autoorganizada** y propusieron que explica fenómenos como los terremotos (la ley de Gutenberg-Richter), los incendios forestales y las extinciones. Bak lo divulgó en *How Nature Works* (1996).

#### 18.5 Llamas y frentes: la velocidad de la cadena

En el modo red, la reacción avanza desde el centro como un frente, a un ritmo de una ficha por paso. Las llamas y otros frentes reales también tienen una velocidad característica, y su cálculo es uno de los problemas clásicos de la física de la combustión.

Ernest-François Mallard y Henry Le Chatelier midieron en 1883 la velocidad de propagación de llamas en mezclas de gases y propusieron que el frente avanza porque el calor liberado en la zona que arde calienta, por conducción, la capa vecina hasta su temperatura de ignición. Es la regla de la herramienta: la energía liberada por una ficha llega a la vecina y, si alcanza su barrera, la activa. Yakov Zel'dovich y David Frank-Kamenetskii dieron en 1938 la teoría cuantitativa de la velocidad de una llama laminar, combinando la cinética de Arrhenius con la difusión del calor.

Un año antes, en 1937, Ronald Fisher (*Annals of Eugenics*, 7, 355–369) y, por separado, Andrei Kolmogorov, Ivan Petrovsky y Nikolai Piskunov estudiaron una ecuación de reacción-difusión para la expansión de un gen favorable en una población:

$$ ∂u/∂t = D ∂²u/∂x² + r u (1 − u) $$

Mostraron que tiene soluciones de frente viajero con velocidad mínima

$$ v = 2 √(D r) $$

donde D mide cuán rápido se difunde algo y r cuán rápido se multiplica. La misma ecuación describe la invasión de una especie, el avance de una epidemia en el espacio o la propagación de una reacción química autocatalítica. La herramienta es una versión discreta y determinista de la misma idea: un frente que avanza a velocidad fija (un sitio por paso) porque cada sitio activado activa a sus vecinos en el paso siguiente. Con variabilidad, el frente se vuelve irregular y más lento: la red con variabilidad 0,3 tarda 26 pasos en vez de 20.

En combustión se distinguen dos regímenes de propagación: la **deflagración**, en la que el frente avanza por conducción de calor a velocidades por debajo de la del sonido (una vela, una cocina a gas), y la **detonación**, en la que avanza como una onda de choque. La segunda es la que la tarjeta "Dónde falla la metáfora" menciona al decir que una detonación se propaga en todas direcciones. La herramienta no modela ninguna de las dos en detalle: su frente es una caricatura que sirve para ver que la propagación depende de un umbral local.

### 19. Tres cadenas que cambiaron el mundo

La reacción en cadena no es solo un concepto de manual. Tres ejemplos muestran su alcance, para bien y para mal, y cada uno ilumina un parámetro distinto de la herramienta.

#### 19.1 El cloro y el ozono: un catalizador que no se gasta

En 1974, Mario Molina y F. Sherwood Rowland publicaron en *Nature* (249, 810–812) un artículo de tres páginas con una advertencia. Los clorofluorocarbonos (CFC), gases usados en aerosoles y heladeras, considerados inertes e inofensivos, suben lentamente hasta la estratosfera. Allí la radiación ultravioleta los rompe y libera átomos de cloro. Cada átomo de cloro reacciona con una molécula de ozono, formando monóxido de cloro y oxígeno; el monóxido de cloro reacciona con un átomo de oxígeno y **devuelve el átomo de cloro libre**, listo para destruir otra molécula de ozono. Es una reacción en cadena catalítica: el cloro no se consume. Se estima que un solo átomo de cloro puede destruir del orden de cien mil moléculas de ozono antes de quedar atrapado en una forma inactiva.

En el lenguaje de la herramienta, cada átomo de cloro es una ficha que nunca termina de caer: libera la energía para tirar a la siguiente y vuelve a pararse. La cadena se termina solo por reacciones de **terminación**, que secuestran el cloro en compuestos estables.

En 1985, Joseph Farman, Brian Gardiner y Jonathan Shanklin, del British Antarctic Survey, publicaron la detección de una caída dramática del ozono sobre la Antártida en primavera (*Nature*, 315, 207–210): el "agujero de ozono". El Protocolo de Montreal de 1987 acordó eliminar progresivamente los CFC, y es considerado uno de los tratados ambientales más exitosos de la historia. Paul Crutzen, Molina y Rowland recibieron el Premio Nobel de Química en 1995. Mario Molina, nacido en México, fue el primer mexicano en recibir un Nobel de ciencias.

La lección para la herramienta: una cadena catalítica puede tener efectos enormes con cantidades mínimas del agente que la inicia, y su peligro no está en la energía de cada paso sino en que el agente se regenera.

#### 19.2 La polimerización: cadenas que construyen

No todas las reacciones en cadena destruyen. Muchos plásticos se fabrican por **polimerización en cadena**: una molécula reactiva (un iniciador) se une a una molécula pequeña (un monómero, como el etileno), y el producto sigue siendo reactivo, así que se une a otro monómero, y a otro, formando una cadena de miles de unidades. Así se producen el polietileno, el poliestireno y el PVC.

La idea de que existían moléculas gigantes formadas por la unión de miles de unidades fue resistida durante años. Hermann Staudinger la defendió desde 1920 (*Berichte der Deutschen Chemischen Gesellschaft*, 53, 1073–1085), contra la opinión dominante de que esas sustancias eran agregados de moléculas chicas. Recibió el Premio Nobel de Química en 1953. Karl Ziegler y Giulio Natta desarrollaron en los años cincuenta catalizadores que permitían controlar la polimerización y obtener plásticos con propiedades precisas, y compartieron el Nobel de 1963.

En la polimerización, las tres etapas de una reacción en cadena se ven con claridad: **iniciación** (el iniciador activa el primer monómero), **propagación** (la cadena crece) y **terminación** (dos cadenas reactivas se encuentran y se anulan, o la cadena se transfiere). La longitud final de las cadenas, y con ella las propiedades del plástico, depende de la competencia entre propagación y terminación: un equilibrio parecido al de la condición η · Q ≥ Ea de la fila, pero en el que lo que se controla es cuánto dura la cadena antes de cortarse.

#### 19.3 La PCR: una cadena que se duplica

En 1983, Kary Mullis, químico de la empresa Cetus, tuvo la idea de la **reacción en cadena de la polimerasa** (PCR). Se parte de una muestra con unas pocas copias de un fragmento de ADN. Se calienta para separar las dos hebras, se enfría para que se peguen unos cebadores cortos en los extremos del fragmento y una enzima, la ADN polimerasa, copia cada hebra. Al final del ciclo, hay el doble de copias. Repitiendo el ciclo treinta veces, una sola copia se convierte en unos mil millones. Randall Saiki, Mullis y colaboradores publicaron la primera aplicación en 1985 (*Science*, 230(4732), 1350–1354), y Mullis recibió el Premio Nobel de Química en 1993. La PCR se volvió una de las técnicas más usadas de la biología: diagnóstico, medicina forense, paleogenética, y, durante la pandemia de COVID-19, la prueba de referencia para detectar el virus.

La PCR es la versión más pura de una cadena ramificada: cada copia produce dos en el ciclo siguiente, un factor de multiplicación k = 2, y el número crece como 2ⁿ. A diferencia de una explosión, la cadena está controlada por el ciclo de temperatura: no avanza sola sino un paso por ciclo, como la simulación de la herramienta avanza un paso por ronda. Y se detiene cuando se agotan los ingredientes (cebadores, nucleótidos), que es la versión química del tope de fichas de la red.

### 20. La herramienta en el aula de química

#### 20.1 Qué conceptos cubre y cuáles no

En los programas de química de la escuela secundaria, la energía de activación, los catalizadores y la diferencia entre reacciones exotérmicas y endotérmicas aparecen en el estudio de la cinética y la termoquímica. La herramienta cubre bien:

- la existencia de una barrera que hay que superar para que una reacción empiece, aunque libere energía;
- la diferencia entre la energía liberada (Q, termodinámica) y la barrera (Ea, cinética);
- el efecto de un catalizador: baja la barrera sin cambiar la energía liberada;
- la idea de umbral y de propagación.

No cubre, y conviene complementarlo:

- la **temperatura**: en una reacción real, la "mano que empuja" es la agitación térmica, y la fracción de moléculas que supera la barrera depende de la temperatura según Arrhenius;
- la **concentración**: la velocidad depende de cuántas moléculas hay por volumen, algo que la ley de acción de masas de Cato Guldberg y Peter Waage formuló en 1864;
- el **equilibrio químico**: muchas reacciones no van hasta el final sino hasta un equilibrio entre reactivos y productos, que se desplaza según el principio de Le Chatelier;
- las reacciones **endotérmicas**, que absorben energía: en la metáfora, fichas que hay que levantar, no tirar.

#### 20.2 Una secuencia didáctica de tres clases

1. **Primera clase: la ficha.** Fichas reales sobre la mesa. Medir con una regla cuánto sube el centro de masa al inclinar una ficha y cuánto baja al caer. Introducir Ea y Q. Usar la herramienta en modo fila para encontrar la condición η · Q ≥ Ea.
2. **Segunda clase: el catalizador y la temperatura.** Usar el catalizador de la herramienta. Después, discutir qué pasaría si las fichas temblaran (temperatura): algunas caerían solas. Conectar con la ecuación de Arrhenius y con ejemplos cotidianos (la heladera conserva los alimentos porque baja la velocidad de las reacciones de descomposición).
3. **Tercera clase: las cadenas.** Modo red, variabilidad y percolación. Discutir el ozono y la PCR como cadenas reales. Cerrar con la tarjeta "Dónde falla la metáfora" y con la pregunta de dónde sale la energía en una reacción exotérmica.

La secuencia tiene un orden deliberado: de lo concreto (fichas que se pueden tocar) a lo abstracto (moléculas que no se ven), y de la metáfora a sus límites. Es el orden que recomienda la investigación en didáctica de las ciencias para trabajar con analogías: presentarla, usarla y, al final, señalar explícitamente dónde deja de valer, para que no se convierta en un error conceptual.

### 21. Del modelo al código

| Concepto | Función en `src/reaccion.js` | Qué produce en la página |
|---|---|---|
| Generador pseudoaleatorio con semilla | `rng(semilla)` | Variabilidad repetible |
| Barreras de cada ficha | `barreras(p)` | Ea, a la mitad con catalizador, con variabilidad |
| Vecinas de cada ficha | `vecinos(i, x)` | Una hacia adelante (fila) o cuatro (red) |
| Simulación por pasos | `simular(p)` | Fichas caídas, pasos, energía liberada, resultado |
| Condición de la fila | `seSostieneEnFila(p)` | η · Q ≥ Ea; base de la pista |
| Perfil de energía | `perfil(p)` | El diagrama reactivos-barrera-productos |

Los tests (`test/reaccion.test.js`) verifican: que en la fila, si η · Q alcanza Ea, caen todas, una por paso; que si no la alcanza, solo cae la primera; que sin empujón suficiente no pasa nada; que el catalizador baja la barrera y destraba la cadena; que en la red con energía de sobra cae todo en tantos pasos como la distancia al centro; que si a cada vecina le llega η · Q/4 < Ea la cadena muere en el centro; que la variabilidad es repetible con la misma semilla, y que el perfil arranca en Q, sube Ea por encima y termina en 0.

```js
const R = require("./src/reaccion.js");
R.simular({ modo: "fila", Ea: 5, Q: 8, eta: 0.7, E0: 6 }).caidas;        // 24
R.simular({ modo: "fila", Ea: 6, Q: 8, eta: 0.7, E0: 6 }).caidas;        // 1
R.simular({ modo: "red", ancho: 25, alto: 15, Ea: 1.2 }).pasos.length;   // 20
```

### 22. Recorrido para clase

La idea original pedía un recorrido guiado para usar la herramienta en clase. Esta es una propuesta de 30 minutos.

1. **La torre quieta (5 min).** Mostrar la fila sin empujar. Preguntar: ¿hay energía guardada? ¿Por qué no se libera sola? Introducir la palabra *metaestable*.
2. **El empujón mínimo (5 min).** Bajar el empujón a 4,5 y empujar: no pasa nada. Subirlo a 5 y empujar: arranca. Introducir *energía de activación* con el perfil de energía.
3. **La cascada (5 min).** Con los valores de base, empujar y ver caer las 24. Preguntar: ¿de dónde salió la energía para tirar la ficha 24? No del empujón: de la ficha 23. Introducir *reacción en cadena* y la condición η · Q ≥ Ea.
4. **El eslabón débil (5 min).** Subir la variabilidad a 0,2 en la fila: se corta en la ficha 3. Pasar a la red con variabilidad 0,3: cae todo. Discutir por qué la redundancia hace robusta a la red.
5. **El catalizador (5 min).** Con Ea = 6, la fila se corta. Marcar catalizador: cae todo. Preguntar: ¿se liberó más energía? No: 192 en los dos casos. El catalizador cambió el camino, no el destino.
6. **Dónde falla (5 min).** Leer juntos la tarjeta "Dónde falla la metáfora". Pedir que cada estudiante escriba, con sus palabras, de dónde sale la energía en una reacción química exotérmica. Corregir el error de "romper enlaces libera energía".

### 23. Ejercicios

1. Con Q = 8 y η = 0,7, ¿cuál es la Ea máxima que permite una cadena completa en la fila? ¿Y en la red?
2. Si se duplica Q, ¿cuánto puede subir Ea? ¿Y si se duplica η?
3. Calculá cuánto sube el centro de masa de una ficha de 48 mm de alto y 7,5 mm de espesor al inclinarse hasta su punto de equilibrio. Compará con cuánto baja al caer.
4. La ecuación de Arrhenius dice que k ∝ e^(−Ea/RT). Si un catalizador baja Ea de 75 kJ/mol a 50 kJ/mol, ¿cuánto se acelera la reacción a 25 °C? (R = 8,314 J/(mol·K).)
5. En la red con Ea = 1,3, probá variabilidades crecientes hasta 0,5. ¿La cadena deja de completarse en algún momento? ¿Cómo cambia el número de pasos? Explicá por qué la red tolera tanto desorden y la fila tan poco.
6. Una epidemia tiene R₀ = 3. ¿Qué fracción de la población hay que vacunar para que no pueda sostenerse? Relacionalo con la condición de la fila.
7. Diseñá en papel el modo "dominós crecientes" de Whitehead: ¿cómo cambiarían Q y Ea de ficha a ficha? ¿Qué condición tendría que cumplirse para que la cadena se sostenga?

### 24. Glosario

- **Energía de activación (Ea):** energía mínima que hay que aportar para que un proceso empiece.
- **Estado de transición:** configuración de máxima energía en el camino de reactivos a productos.
- **Catalizador:** sustancia que baja la barrera de una reacción sin consumirse ni cambiar la energía liberada.
- **Metaestable:** estable ante perturbaciones chicas, pero con un estado de menor energía detrás de una barrera.
- **Reacción en cadena:** proceso en el que cada evento produce las condiciones para el siguiente.
- **Cadena ramificada:** reacción en cadena en la que cada eslabón activa a más de uno.
- **Factor de multiplicación (k) / número reproductivo (R₀):** cuántos eventos nuevos produce cada evento; la cadena crece si es mayor que 1.
- **Percolación:** estudio de cuándo un proceso puede atravesar un medio con huecos o defectos.
- **Nucleación:** formación del primer núcleo de una fase nueva, que requiere superar una barrera.
- **Exotérmica:** reacción que libera energía, porque los productos tienen menos energía que los reactivos.

### 25. Conclusión

Una fila de fichas de dominó reúne, en un objeto de juguete, tres ideas que la química tardó décadas en formular: que casi todo lo que puede liberar energía necesita un empujón inicial (Arrhenius, Eyring, Evans y Polanyi), que las cosas pueden estar quietas sin estar a salvo (el diamante, el agua sobreenfriada, el vidrio), y que una liberación de energía puede sostenerse sola si cada eslabón activa al siguiente (Bodenstein, Semenov, Hinshelwood, y después la física nuclear, la neurofisiología de Hodgkin y Huxley y la epidemiología de Kermack y McKendrick). La herramienta reduce todo a una desigualdad, η · Q ≥ Ea, y deja ver en segundos qué pasa a cada lado del umbral, qué hace un catalizador y por qué una red es más robusta que una fila.

También deja claro dónde la metáfora deja de servir: romper enlaces no libera energía, las reacciones reales tienen temperatura y difusión, y los frentes químicos no avanzan de a una ficha. Los próximos pasos que el proyecto propone son agregar el modo de dominós crecientes de Whitehead, probar el prototipo con fichas reales con alguien que no sepa química y armar el recorrido guiado para clase que esta guía esboza en la sección 22.

## Referencias

- Anderson, P. W. (1995). Through the glass lightly. *Science*, 267(5204), 1615–1616. https://doi.org/10.1126/science.267.5204.1615-e
- Arrhenius, S. (1889). Über die Reaktionsgeschwindigkeit bei der Inversion von Rohrzucker durch Säuren. *Zeitschrift für physikalische Chemie*, 4, 226–248. https://doi.org/10.1515/zpch-1889-0416
- Bak, P. (1996). *How Nature Works: The Science of Self-Organized Criticality*. Copernicus. ISBN 978-0-387-94791-4.
- Bak, P., Tang, C., & Wiesenfeld, K. (1987). Self-organized criticality: An explanation of the 1/f noise. *Physical Review Letters*, 59(4), 381–384. https://doi.org/10.1103/PhysRevLett.59.381
- Bodenstein, M. (1913). Eine Theorie der photochemischen Reaktionsgeschwindigkeiten. *Zeitschrift für physikalische Chemie*, 85, 329–397. https://doi.org/10.1515/zpch-1913-8512
- Boo, H. K. (1998). Students' understandings of chemical bonds and the energetics of chemical reactions. *Journal of Research in Science Teaching*, 35(5), 569–581. https://doi.org/10.1002/(SICI)1098-2736(199805)35:5<569::AID-TEA6>3.0.CO;2-N
- Broadbent, S. R., & Hammersley, J. M. (1957). Percolation processes: I. Crystals and mazes. *Mathematical Proceedings of the Cambridge Philosophical Society*, 53(3), 629–641. https://doi.org/10.1017/S0305004100032680
- Evans, M. G., & Polanyi, M. (1935). Some applications of the transition state method to the calculation of reaction velocities, especially in solution. *Transactions of the Faraday Society*, 31, 875–894. https://doi.org/10.1039/TF9353100875
- Eyring, H. (1935). The activated complex in chemical reactions. *Journal of Chemical Physics*, 3(2), 107–115. https://doi.org/10.1063/1.1749604
- Farman, J. C., Gardiner, B. G., & Shanklin, J. D. (1985). Large losses of total ozone in Antarctica reveal seasonal ClOx/NOx interaction. *Nature*, 315, 207–210. https://doi.org/10.1038/315207a0
- Fisher, R. A. (1937). The wave of advance of advantageous genes. *Annals of Eugenics*, 7(4), 355–369. https://doi.org/10.1111/j.1469-1809.1937.tb02153.x
- Galley, W. C. (2004). Exothermic bond breaking: A persistent misconception. *Journal of Chemical Education*, 81(4), 523–525. https://doi.org/10.1021/ed081p523
- Gibbs, J. W. (1876–1878). On the equilibrium of heterogeneous substances. *Transactions of the Connecticut Academy of Arts and Sciences*, 3, 108–248 y 343–524.
- Guldberg, C. M., & Waage, P. (1864). Studier over affiniteten. *Forhandlinger i Videnskabs-Selskabet i Christiania*, 35–45.
- Hess, G. H. (1840). Thermochemische Untersuchungen. *Annalen der Physik und Chemie*, 126(6), 385–404. https://doi.org/10.1002/andp.18401260620
- Hodgkin, A. L., & Huxley, A. F. (1952). A quantitative description of membrane current and its application to conduction and excitation in nerve. *Journal of Physiology*, 117(4), 500–544. https://doi.org/10.1113/jphysiol.1952.sp004764
- Kermack, W. O., & McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. *Proceedings of the Royal Society A*, 115(772), 700–721. https://doi.org/10.1098/rspa.1927.0118
- Kolmogorov, A. N., Petrovsky, I. G., & Piskunov, N. S. (1937). Étude de l'équation de la diffusion avec croissance de la quantité de matière et son application à un problème biologique. *Bulletin de l'Université d'État de Moscou, Série internationale, Section A*, 1(6), 1–26.
- Kramers, H. A. (1940). Brownian motion in a field of force and the diffusion model of chemical reactions. *Physica*, 7(4), 284–304. https://doi.org/10.1016/S0031-8914(40)90098-2
- van Leeuwen, J. M. J. (2010). The domino effect. *American Journal of Physics*, 78(7), 721–727. https://doi.org/10.1119/1.3360783
- Mallard, E., & Le Chatelier, H. (1883). Recherches expérimentales et théoriques sur la combustion des mélanges gazeux explosifs. *Annales des Mines*, 8(4), 274–568.
- McLachlan, B. G., Beaupre, G., Cox, A. B., & Gore, L. (1983). Falling dominoes (D. E. Daykin). *SIAM Review*, 25(3), 403–404. https://doi.org/10.1137/1025083
- Meitner, L., & Frisch, O. R. (1939). Disintegration of uranium by neutrons: A new type of nuclear reaction. *Nature*, 143, 239–240. https://doi.org/10.1038/143239a0
- Molina, M. J., & Rowland, F. S. (1974). Stratospheric sink for chlorofluoromethanes: Chlorine atom-catalysed destruction of ozone. *Nature*, 249, 810–812. https://doi.org/10.1038/249810a0
- Saiki, R. K., Scharf, S., Faloona, F., Mullis, K. B., Horn, G. T., Erlich, H. A., & Arnheim, N. (1985). Enzymatic amplification of β-globin genomic sequences and restriction site analysis for diagnosis of sickle cell anemia. *Science*, 230(4732), 1350–1354. https://doi.org/10.1126/science.2999980
- Semenov, N. N. (1935). *Chemical Kinetics and Chain Reactions*. Oxford: Clarendon Press.
- Shaw, D. E. (1978). Mechanics of a chain of dominoes. *American Journal of Physics*, 46(6), 640–642. https://doi.org/10.1119/1.11221
- Smil, V. (2001). *Enriching the Earth: Fritz Haber, Carl Bosch, and the Transformation of World Food Production*. MIT Press. ISBN 978-0-262-19449-5.
- Staudinger, H. (1920). Über Polymerisation. *Berichte der Deutschen Chemischen Gesellschaft*, 53(6), 1073–1085. https://doi.org/10.1002/cber.19200530627
- Stauffer, D., & Aharony, A. (1994). *Introduction to Percolation Theory* (2.ª ed.). Taylor & Francis. ISBN 978-0-7484-0253-3.
- Whitehead, L. A. (1983). Domino "chain reaction". *American Journal of Physics*, 51(2), 182. https://doi.org/10.1119/1.13318
- Wolfenden, R., & Snider, M. J. (2001). The depth of chemical time and the power of enzymes as catalysts. *Accounts of Chemical Research*, 34(12), 938–945. https://doi.org/10.1021/ar000058i
- Zel'dovich, Y. B., & Frank-Kamenetskii, D. A. (1938). A theory of thermal propagation of flame. *Acta Physicochimica URSS*, 9, 341–350.
