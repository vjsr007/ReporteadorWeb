using System;
using System.Configuration;

namespace ReporteadorWeb.Modelo
{
    public partial class DatabaseContext
    {
        private const String Db = "DatabaseConnectionString";

        public static DatabaseContext GetDataContext()
        {
            var conexion = ConnectionString.GetConnectionString(Db);
            var timeout = Convert.ToInt32(ConfigurationManager.AppSettings["Timeout"]);
            if (!string.IsNullOrEmpty(conexion))
            {
                var cnn = new DatabaseContext(conexion) { CommandTimeout = timeout };
                return cnn;
            }
            return null;
        }
    }
}