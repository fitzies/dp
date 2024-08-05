const PageWrapper = ({
  children,
  className,
}: {
  children: any;
  className?: string;
}) => {
  return (
    <div className={"w-screen h-screen lg:px-72 px-10 py-20  " + className}>
      {children}
    </div>
  );
};

export default PageWrapper;
