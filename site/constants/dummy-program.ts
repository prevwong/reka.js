import { Parser } from '@composite/parser';

export const DUMMY_PROGRAM = Parser.parse(`
val globalText = "something else";
val globalCounter = 0;

component App() {
  val text = "Bye";
} => (
  <div className={"w-full h-full"}>
   <div style={{ backgroundImage: "linear-gradient(188deg, rgb(255 255 255), rgb(238 251 250), rgb(255 255 255))" }} className={"bg-orange-100 text-neutral-800 w-full h-full flex flex-col items-center justify-center"}>
    <h2 className={"text-6xl font-extrabold tracking-tighter"}>
     <text value={"Welcome to my app"} />
    </h2>
    <p className={"opacity-80 font-light tracking-tighter text-2xl"}>
     <text value={"It's a really cool app"} />
    </p>
    <Button className={"mt-3"} text={(globalCounter < 2) ? "Click me " + (2 - globalCounter) + " more times" : "Hooray"} onClick={() => {
      globalCounter = globalCounter + 1;

      if ( globalCounter >= 2  ) {
        confetti();
      }
    }}  />
   </div>
   <div className={"py-4 px-4"}>
    <h2 className={"text-3xl"}>
     <text value={"Posts"} />
    </h2>
    <div className={"mt-2 grid grid-cols-2 gap-4"}>
     <Card name={post.name} description={post.description} image={post.image} @each={post in posts} />
    </div>
   </div>
  </div>
)

component Button(className,text,icon,onClick=() => {}) {
  val counter = 1;
} => (
  <button className={"flex items-center gap-2 px-4 py-2 text-xs cursor-pointer rounded-full bg-black hover:bg-neutral-500 text-white "+className} onClick={onClick}>
   <span>
    <text value={text} />
   </span>
   <Icon name={icon} @if={icon} />
  </button>
)

component Card(name,description,image="/images/placeholder.jpeg") {
} => (
  <div>
   <img src={image} />
   <div className={"mt-2"}>
    <h2 className={"text-lg"}>
     <text value={name} />
    </h2>
    <p className={"text-xs opacity-60"}>
     <text value={description} />
    </p>
    <Button className={"mt-2"} text={"Visit page"} icon={"ArrowRightIcon"} />
   </div>
  </div>
)

`);
