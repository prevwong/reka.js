import { Parser } from '@composite/parser';

export const DUMMY_PROGRAM = Parser.parseProgram(`
val globalText = "something else";
val globalCounter = 0;
val isModalOpen = false;

component App() {
 val text = "Bye";
 val counter = 0;
} => (
 <div className={"w-full h-full"}>
  <Header/>
  <div
   style={{
    "backgroundImage": "linear-gradient(188deg, rgb(255 255 255), rgb(238 251 250), rgb(255 255 255))",
    "backgroundSize": "400% 400%"
   }}
   className={"bg-orange-100 gradient-animation text-neutral-800 w-full h-full flex flex-col justify-center"}
  >
   <div className={"px-8 w-full text-center flex flex-col items-center"}>
    <h2 className={"text-4xl mb-4 font-semibold tracking-tighter"}>
     <text value={"Build powerful no-code editors"}/>
    </h2>
    <div className={"flex flex-col gap-4 px-12 opacity-80 font-light tracking-tight text-md"}>
     <p>
      <text value={"Composite is a state management system for building no-code editors."}/>
      <br />
      <text value={"It enables you to build page editors where your users can design complex UI components on the browser the same way you could with code."} />
     </p>
    </div>
    <Button
     className={"mt-3 bg-indigo-500"}
     text={"Show me confetti"}
     icon={"HeartFilledIcon"}
     onClick={() => {
       $confetti();
     }}
    />
   </div>
  </div>
  <div className="pt-20 pb-10">
    <div className="flex">
      <div className="px-8 w-1/3">
        <h2 className="text-2xl font-semibold tracking-tighter">
          <text value={"Powered by code, unlimited flexibility"} />
        </h2>
      </div>
      <div className="flex-1 px-8 text-slate-600">
      <p>
        <text value={"The contents of the editor is stored in an Abstract Syntax Tree, along with an interpreter that efficiently evaluates the output to render. This means your end-users could design UI components with the power of expressions, states, conditionals and loops."} />
      </p>
      </div>
    </div>
    <div className="grid grid-cols-2 mt-8 px-8 gap-6">
      <FeatureCard 
        title="Components" 
        description={"End-users can design components with stateful values, expressions and templates similar to what is possible with code in UI frameworks like React."} 
      >
        <div className="flex flex-col justify-center">
          <h4 className="mb-2 text-xs text-neutral-600">
            <text value={"Counter -> " + counter} />
          </h4>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                counter = counter + 1;
              }} 
              icon={"PlusIcon"} 
            />
            <Button 
              onClick={() => {
                counter = counter - 1;
              }} 
              icon={"MinusIcon"} 
            />
            <Button 
              onClick={() => {
                isModalOpen = true;
              }} 
              text="Toggle Modal" 
            />
          </div>
        </div>  
      </FeatureCard>
     
      <FeatureCard 
        title="External Functionalities" 
        noPadding={true}
        description={"Expose Javascript functions or React/Vue/Svelte from your codebase for your end-users to use in their pages"} 
      >
        <Animation />
      </FeatureCard>

      <FeatureCard 
        title="Realtime Collaboration" 
        noPadding={true}
        description={"Composite enables an opt-in multiplayer functionality via CRDTs. Go ahead and edit this page in another tab to see it in action!"} 
      >
        <img src="/images/placeholder.jpeg" className="object-cover" />
      </FeatureCard>
      <FeatureCard 
        title="Extensible" 
        noPadding={true}
        description={"Need to create a Figma-like commenting system for your page editor? Composite lets you to create and store these additional values via extensions."} 
      >
        <img src="/images/extensible.png" />
      </FeatureCard>
    </div>
  </div>
  <div className={"py-10 px-8"}>
   <header className="w-2/4">
    <h2 className={"text-2xl font-semibold mb-3"}>
      <text value={"Lists"}/>
    </h2>
    <p className="text-md text-slate-600">
      <text value={"We can even render an element multiple times from a list, just like you could with a map function in React. The following cards are rendered from items in a list"}/>
    </p>
   </header>
   <div className={"mt-4 grid grid-cols-2 gap-4"}>
    <Card
     name={post.name}
     description={post.description}
     image={post.image}
     @each={post in posts}
    />
   </div>
  </div>
  <Modal
   isOpen={isModalOpen}
   onClose={() => {
    isModalOpen = false;
   }}
   title={"Contact us"}
  >
   <p className={"text-sm text-slate-700 mb-8"}>
    <text value={"The end-users of your page builder could even build complex UI components like Modals the same way you as a developer could in code"}/>
   </p>
   <Button
    text={"Noice"}
    onClick={() => {
     isModalOpen = false;
    }}
   />
  </Modal>
 </div>
)

component FeatureCard(title="Feature", description,noPadding=false) => (
  <div 
    className="flex flex-col border-2 border-solid border-black rounded-md overflow-hidden"
   
  >
    <div className="px-5 py-5">
      <h2 className="font-semibold text-lg">
        <text value={title} />
      </h2>
      <p className="text-xs mt-2" @if={description}>
        <text value={description} />
      </p>
    </div>
    <div 
      className="flex-1 flex bg-neutral-100"
      @classList={{
        "px-4": noPadding == false,
        "py-4": noPadding == false
      }}
    >
      <slot />
    </div>
  </div>
)

component Header() => (
 <div
  className={"flex w-full px-8 fixed z-10 items-center ease-in-out duration-200 backdrop-blur-md"}
  @classList={{
   "bg-white/25": $getScrollTop() > 100,
   "py-10": $getScrollTop() <= 100,
   "py-5": $getScrollTop() > 100
  }}
 >
  <div className={"flex-1"}>
   <span className="text-sm font-semibold">
    <text value={"craft.js | composite"}/>
   </span>
  </div>
  <nav className={"list-none"}>
   <Button
    text={"Show Modal"}
    onClick={() => {
     isModalOpen = true;
    }}
   />
  </nav>
 </div>
)

component Modal(title="Modal",isOpen,onClose) => (
 <div
  className={"fixed top-0 left-0 w-screen h-screen bg-black/25 backdrop-blur-md z-50"}
  @if={isOpen}
 >
  <div className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white px-4 py-5 rounded-sm z-50"}>
   <header className={"mb-5 flex items-center"}>
    <h2 className={"flex-1 text-xl font-medium"}>
     <text value={title}/>
    </h2>
    <button
     onClick={() => {
      onClose();
     }}
     className={"opacity-20 hover:opacity-100"}
    >
     <Icon name={"Cross1Icon"}/>
    </button>
   </header>
   <div>
    <slot/>
   </div>
  </div>
 </div>
)

component Button(
 className,
 text,
 icon,
 onClick=() => {}
) {
 val counter = 1;
} => (
 <button
  className={"flex items-center gap-2 px-4 py-2 text-xs cursor-pointer rounded-full bg-black hover:bg-neutral-500 text-white " + className}
  onClick={onClick}
 >
  <span @if={text}>
   <text value={text}/>
  </span>
  <Icon
   name={icon}
   @if={icon}
  />
 </button>
)

component Card(name,description,image="/images/placeholder.jpeg") => (
 <div>
  <img src={image}/>
  <div className={"mt-2"}>
   <h2 className={"text-lg"}>
    <text value={name}/>
   </h2>
   <p className={"text-xs opacity-60"}>
    <text value={description}/>
   </p>
   <Button
    className={"mt-2"}
    text={"Visit page"}
    icon={"ArrowRightIcon"}
   />
  </div>
 </div>
)
`);
