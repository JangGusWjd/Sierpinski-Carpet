/**  교과목: 컴퓨터그래픽스(SW)
     학과: 소프트웨어학과
     학번: 32203928
     이름: 장현정
     Sierpinski Carpet 구현하기: rectangle.js **/

let gl;
let points = []; // 정점을 저장하는 빈 배열 points 생성
let divideNum = 0; // 사각형을 몇개로 나눌지 저장하는 변수 초기화

function init() {
  const canvas = document.getElementById("canvas");
  gl = WebGLUtils.setupWebGL(canvas); // 불러온 캔버스를 인자로 넘겨서 WebGL코드를 설정
  if (!gl) {
    alert("WebGL을 이용할 수 없습니다.");
  }

  gl.viewport(0, 0, canvas.width, canvas.height); // 사물이 그려지는 영역 설정
  gl.clearColor(1.0, 1.0, 1.0, 1.0); // 배경색을 흰색으로 초기화. 사각형은 흰색으로 그려짐.

  //program을 생성해 initShaders를 사용하여 vertex shader, fragment shader로드, 컴파일, 링크하여 대입
  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program); // 프로그램 사용하도록 실시

  // 데이터를 GPU 버퍼에 공급하는 과정
  let cBuffer = gl.createBuffer(); // 버퍼를 생성
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer); //cBuffer를 작업할 버퍼로 설정. ARRAY_BUFFER로 gl에 연결
  // 버퍼에 데이터를 저장.
  // 버퍼의 내용은 변하지 않는 정적인 형태임을 알리기 위해 STATIC_DRAW사용
  gl.bufferData(gl.ARRAY_BUFFER, Math.pow(4, 10), gl.STATIC_DRAW);

  // 프로그램 내 변수와 shader 변수를 연결하기 위해 버퍼내 이름, 타입, 위치가 필요
  // vertex shader의 애트리뷰트가 버퍼의 데이터를 읽어오기 위해 애트리뷰트의 위치를 얻어옴.
  const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexPosition);

  // 사용자에게 슬라이더 값 받아오기
  document.getElementById("slider").onchange = function (e) {
    divideNum = e.target.value;
    render();
  };

  // 브라우저가 처음 로드되었을 때부터 캔버스가 보이기 위해 render()를 수행해줌.
  render();
}

// points 배열에 a, b, c, d인 정점 4개를 넣는 함수 rectangle
function rectangle(a, b, c, d) {
  points.push(a, b, c, d);
}

// a, b, c, d 정점을 가진 사각형을 나누는 divRectangle 함수
function divRectangle(a, b, c, d, count) {
  // 더이상 나눌 필요가 없는 경우
  if (count == 0) {
    rectangle(a, b, c, d);
  } else {
    // 정점 4개로 구성된 사각형의 사이드를 3등분으로 나누는 과정
    const ab1 = mix(a, b, 1 / 3);
    const ab2 = mix(a, b, 2 / 3);

    const bc1 = mix(b, c, 1 / 3);
    const bc2 = mix(b, c, 2 / 3);

    const cd1 = mix(c, d, 1 / 3);
    const cd2 = mix(c, d, 2 / 3);

    const da1 = mix(d, a, 1 / 3);
    const da2 = mix(d, a, 2 / 3);

    const med_a = mix(da2, bc1, 1 / 3);
    const med_b = mix(da2, bc1, 2 / 3);
    const med_c = mix(da1, bc2, 2 / 3);
    const med_d = mix(da1, bc2, 1 / 3);

    --count;

    // 8개의 새로운 사각형
    divRectangle(a, ab1, med_a, da2, count);
    divRectangle(ab1, ab2, med_b, med_a, count);
    divRectangle(ab2, b, bc1, med_b, count);
    divRectangle(med_b, bc1, bc2, med_c, count);
    divRectangle(med_c, bc2, c, cd1, count);
    divRectangle(med_d, med_c, cd1, cd2, count);
    divRectangle(da1, med_d, cd2, d, count);
    divRectangle(da2, med_a, med_d, da1, count);
  }
}

window.onload = init;

function render() {
  // 배열 vertex에 4개의 정점 생성
  const vertex = [vec2(-1, -1), vec2(-1, 1), vec2(1, 1), vec2(1, -1)];
  points = [];
  divRectangle(vertex[0], vertex[1], vertex[2], vertex[3], divideNum);

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let i = 0; i < points.length; i = i + 4) {
    gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
  }
}
