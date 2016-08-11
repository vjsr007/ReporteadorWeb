using System;

namespace ReporteadorWeb.Models
{
    public class UserData
    {
        public Int64? CHARACTER_MAXIMUM_LENGTH { get; set;}
        public string COLUMN_NAME { get; set;}
        public string DATA_TYPE { get; set;}
        public string IS_NULLABLE { get; set;}
        public int? ORDINAL_POSITION { get; set;}
        public string TABLE_NAME { get; set;}
        public string TABLE_SCHEMA { get; set;}
    }
}
