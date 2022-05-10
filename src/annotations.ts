import * as vscode from 'vscode';

type Annotation = {
  id: string;
  line: number;
  text: string;
  color: Color;
};

type Color = {
  color: string;
  backgroundColor: string;
  highlightColor: string;
};

const annotations: Map<String, Annotation> = new Map();

type Decoration = {
  decorator: vscode.TextEditorDecorationType;
  location: vscode.Range;
};

function createDecoration(
  contentText: string,
  line: number,
  color: string = 'grey',
  backgroundColor: string = 'none'
): Decoration {
  const decorator = vscode.window.createTextEditorDecorationType({
    after: {
      contentText,
      color,
      backgroundColor,
      margin: '20px',
    },
  });

  const range = lineToRange(line);
  return {
    decorator,
    location: range,
  };
}

function showDecoration(decoration: Decoration) {
  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(decoration.decorator, [
    { range: decoration.location },
  ]);
}

function showAnnotation(annotation: Annotation, timeout: number = 500) {
  const { text, line, color } = annotation;
  const highlight = createDecoration(text, line, color.highlightColor);
  const normal = createDecoration(text, line, color.color);

  showDecoration(highlight);
  if (timeout > 0) {
    setTimeout(() => {
      highlight.decorator.dispose();
      showDecoration(normal);
    }, timeout);
  }
}

function lineToRange(line: number): vscode.Range {
  const end = 10000; // a large number
  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );
  return range;
}

function addAndShowAnnotation(
  id: string,
  line: number,
  text: string = ' NaN',
  color: Color = {
    color: 'grey',
    backgroundColor: 'none',
    highlightColor: 'grey',
  }
) {
  if (annotations.has(id)) {
    throw new Error(`Annotation ${id} already existing`);
  }

  const annotation: Annotation = {
    id,
    line,
    text,
    color,
  };
  showAnnotation(annotation);
  annotations.set(id, annotation);
}

// function removeAnnotation(id: string) {
//   if (annotations.has(id)) {
//     const annotation = annotations.get(id)!;
//     annotation.decorator.dispose();
//     annotations.delete(id);
//   }
// }

// function removeAllAnnotations() {
//   annotations.forEach(({ decorator }) => decorator.dispose());
//   annotations.clear();
// }

/*
function createAnnotation(
  id: string,
  line: number,
  value: string = ' NaN',
  color: Color = { color: 'grey', backgroundColor: 'none', highlight: 'grey' }
) {
  const annotation: Annotation = {
    id,
    line,
    color,
    decorator: createDecoration(value, color.color, color.backgroundColor),
  };
  return annotation;
}

function updateAnnotation(
  id: string,
  value: string = ' NaN',
  color: Color = { color: 'grey', backgroundColor: 'none', highlight: 'grey' }
) {
  if (!annotations.has(id)) return;

  const annotation = annotations.get(id)!;
  annotation.decorator.dispose();

  // Show highlight
  annotation.decorator = createDecoration(value);
  showAnnotation(annotation);
}

function addAnnotation(
  id: string,
  line: number,
  value: string = ' NaN',
  color: Color = { color: 'grey', backgroundColor: 'none', highlight: 'grey' }
) {
  if (annotations.has(id)) {
    throw new Error('Annotation already exists');
  }
  const annotation = createAnnotation(id, line, value, color);
  showAnnotation(annotation);
  annotations.set(id, annotation);
}



// Helpers

function createDecoration(
  contentText: string,
  color: string = 'grey',
  backgroundColor: string = 'none'
): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    after: {
      contentText,
      color,
      backgroundColor,
      margin: '20px',
    },
  });
}

function lineToRange(line: number) {
  const end = 10000; // a large number
  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );
  return range;
}

function showAnnotation({ line, decorator }: Annotation) {
  const range = lineToRange(line);
  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(decorator, [{ range }]);
}

// function showAnnotationTimed(annotation: Annotation, timeout: number) {

//   setTimeout(() => {
//     annotation.decorator.dispose();
//     showAnnotation(annotation);
//   }, timeout);
// }

/*


function createAnnotation(
  id: string,
  line: number,
  value: string,
  color: string = 'grey',
  animationTime: number = 100
) {
  const annotation: Annotation = {
    id,
    line,
    decorator: createDecoration(value, 'yellow'),
  };
  showAnnotation(annotation);
  // setTimeout(() => {
  //   annotation.decorator.dispose(); // clean
  //   annotation.decorator = createDecoration(value, color);
  //   showAnnotation(annotation);
  // }, animationTime);
}

/*



function renderAnnotation({ line, decorator }: Annotation) {
  // show it
  const end = 10000; // a large number
  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );

  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(decorator, [{ range }]);
}

function createAnnotation(
  id: string,
  line: number,
  value: string,
  color: string = 'grey'
) {
  return  {
    id,
    line,
    value,
    decorator: createDecoration(value, color),
  };
}

function createAnnotation(id: string, line: number) {
  if (annotations.has(id)) {
    throw new Error('Decoration exists');
  }
  // crate a new annotation
  const color = 'grey';
  const value = 'NaN';
  const annotation = {
    id,
    line,
    value,
    decorator: createDecoration(value, 'grey'),
  };
  annotations.set(id, annotation);
  renderAnnotation(annotation);
}

function updateAnnotation(id: string, value: string = 'NaN') {
  if (!annotations.has(id)) {
    throw new Error('Annotation does not exist');
  }
  // crate a new annotation
  const { line } = annotations.get(id)!;
  removeAnnotation(id); // remove if already exists

  let color = 'green';
  const annotation = {
    id,
    line,
    value,
    decorator: createDecoration(value, color),
  };

  annotations.set(id, annotation);
  renderAnnotation(annotation);
}



export { createAnnotation, removeAllAnnotations, updateAnnotation };
*/
export { addAndShowAnnotation };
